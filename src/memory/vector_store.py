"""
Vector Store

Provides semantic search over fetched content using ChromaDB.
Enables finding relevant information across all research materials.
"""

from typing import Any
import uuid
from dataclasses import dataclass, field
from datetime import datetime

from src.utils.logging import get_logger

logger = get_logger(__name__)


@dataclass
class DocumentChunk:
    """A chunk of content stored in the vector database."""
    id: str
    content: str
    url: str = ""
    title: str = ""
    chunk_index: int = 0
    similarity_score: float = 0.0


class VectorStore:
    """
    Vector database for semantic content search.
    
    Uses ChromaDB to store and retrieve content based on
    semantic similarity, enabling:
    - Finding relevant content for follow-up questions
    - Retrieving related facts across sources
    - Avoiding redundant information in reports
    - Supporting context-aware conversations
    """
    
    def __init__(self, collection_name: str = "research_content", persist_directory: str = None):
        self.collection_name = collection_name
        self.persist_directory = persist_directory
        self._client = None
        self._collection = None
        self._document_count = 0
    
    def _get_collection(self):
        """Lazy initialization of ChromaDB collection."""
        if self._collection is None:
            try:
                import chromadb
                from chromadb.config import Settings
                
                # Create client (in-memory for now, can be made persistent)
                settings_dict = {
                    "anonymized_telemetry": False,
                    "allow_reset": True
                }
                
                if self.persist_directory:
                    settings_dict["persist_directory"] = self.persist_directory
                    settings_dict["is_persistent"] = True
                
                self._client = chromadb.Client(Settings(**settings_dict))
                
                # Get or create collection with cosine similarity
                self._collection = self._client.get_or_create_collection(
                    name=self.collection_name,
                    metadata={"hnsw:space": "cosine"}
                )
                
            except ImportError:
                raise ImportError("chromadb is required. Install with: pip install chromadb")
        
        return self._collection
    
    def add_document(
        self, 
        content: str, 
        metadata: dict[str, Any] | None = None
    ) -> str:
        """
        Add a document to the vector store.
        
        Args:
            content: The text content to store
            metadata: Additional metadata (url, title, etc.)
            
        Returns:
            The document ID
        """
        if not content or len(content.strip()) < 50:
            return ""
        
        collection = self._get_collection()
        doc_id = str(uuid.uuid4())
        
        try:
            # Chunk long content with overlap for better context
            chunks = self._chunk_content(content, chunk_size=800, overlap=100)
            
            for i, chunk in enumerate(chunks):
                chunk_id = f"{doc_id}_{i}"
                chunk_metadata = {
                    **(metadata or {}), 
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                    "doc_id": doc_id,
                    "timestamp": datetime.now().isoformat()
                }
                
                collection.add(
                    documents=[chunk],
                    metadatas=[chunk_metadata],
                    ids=[chunk_id]
                )
            
            self._document_count += 1
            logger.info(f"Added document {doc_id} with {len(chunks)} chunks")
            return doc_id
            
        except Exception as e:
            logger.error(f"Failed to add document: {e}")
            return ""
    
    def add_fact(self, fact: dict[str, Any]) -> str:
        """
        Add an extracted fact to the vector store.
        
        Args:
            fact: Dictionary with content, source_url, type, confidence
            
        Returns:
            The fact ID
        """
        content = fact.get("content", "")
        if not content:
            return ""
        
        collection = self._get_collection()
        fact_id = f"fact_{uuid.uuid4()}"
        
        try:
            metadata = {
                "type": "fact",
                "fact_type": fact.get("type", "unknown"),
                "confidence": fact.get("confidence", "medium"),
                "source_url": fact.get("source_url", ""),
                "timestamp": datetime.now().isoformat()
            }
            
            collection.add(
                documents=[content],
                metadatas=[metadata],
                ids=[fact_id]
            )
            
            return fact_id
            
        except Exception as e:
            logger.error(f"Failed to add fact: {e}")
            return ""
    
    def search(
        self, 
        query: str, 
        top_k: int = 5,
        filter_metadata: dict[str, Any] | None = None,
        include_facts: bool = True
    ) -> list[DocumentChunk]:
        """
        Search for relevant content.
        
        Args:
            query: The search query
            top_k: Number of results to return
            filter_metadata: Optional metadata filters
            include_facts: Whether to include stored facts
            
        Returns:
            List of matching DocumentChunks
        """
        if not query:
            return []
        
        collection = self._get_collection()
        
        try:
            results = collection.query(
                query_texts=[query],
                n_results=top_k,
                where=filter_metadata,
                include=["documents", "metadatas", "distances"]
            )
            
            chunks = []
            documents = results.get("documents", [[]])[0]
            metadatas = results.get("metadatas", [[]])[0]
            distances = results.get("distances", [[]])[0]
            
            for i, doc in enumerate(documents):
                metadata = metadatas[i] if i < len(metadatas) else {}
                distance = distances[i] if i < len(distances) else 1.0
                
                # Convert distance to similarity (cosine distance to similarity)
                similarity = 1.0 - distance
                
                chunks.append(DocumentChunk(
                    id=f"result_{i}",
                    content=doc,
                    url=metadata.get("url", ""),
                    title=metadata.get("title", ""),
                    chunk_index=metadata.get("chunk_index", 0),
                    similarity_score=similarity
                ))
            
            return chunks
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []
    
    def find_related_content(
        self,
        question: str,
        existing_facts: list[dict[str, Any]],
        top_k: int = 5
    ) -> list[DocumentChunk]:
        """
        Find content related to a follow-up question.
        
        Combines semantic search with fact-based context.
        
        Args:
            question: The follow-up question
            existing_facts: Facts already extracted
            top_k: Number of results
            
        Returns:
            Relevant content chunks
        """
        # Direct semantic search
        direct_results = self.search(question, top_k=top_k)
        
        # If we have existing facts, also search based on fact content
        fact_based_results = []
        for fact in existing_facts[:3]:  # Use top 3 facts for context
            fact_content = fact.get("content", "")
            if fact_content:
                # Combine question with fact for richer search
                combined_query = f"{question} {fact_content[:100]}"
                fact_results = self.search(combined_query, top_k=2)
                fact_based_results.extend(fact_results)
        
        # Deduplicate and sort by similarity
        seen_content = set()
        all_results = []
        
        for chunk in direct_results + fact_based_results:
            content_key = chunk.content[:100]
            if content_key not in seen_content:
                seen_content.add(content_key)
                all_results.append(chunk)
        
        # Sort by similarity and return top_k
        all_results.sort(key=lambda x: x.similarity_score, reverse=True)
        return all_results[:top_k]
    
    def get_context_for_synthesis(
        self,
        question: str,
        max_chunks: int = 10,
        max_chars: int = 8000
    ) -> str:
        """
        Get relevant context for report synthesis.
        
        Args:
            question: The research question
            max_chunks: Maximum number of chunks
            max_chars: Maximum total characters
            
        Returns:
            Combined context string
        """
        chunks = self.search(question, top_k=max_chunks)
        
        context_parts = []
        total_chars = 0
        
        for chunk in chunks:
            if total_chars + len(chunk.content) > max_chars:
                break
            
            source_info = f"[Source: {chunk.url}]" if chunk.url else ""
            context_parts.append(f"{chunk.content}\n{source_info}")
            total_chars += len(chunk.content)
        
        return "\n\n---\n\n".join(context_parts)
    
    def _chunk_content(
        self, 
        content: str, 
        chunk_size: int = 800,
        overlap: int = 100
    ) -> list[str]:
        """
        Split content into overlapping chunks for better context.
        
        Args:
            content: Text to chunk
            chunk_size: Target chunk size in characters
            overlap: Overlap between chunks
            
        Returns:
            List of text chunks
        """
        if len(content) <= chunk_size:
            return [content]
        
        chunks = []
        words = content.split()
        current_chunk = []
        current_length = 0
        
        for word in words:
            word_length = len(word) + 1
            if current_length + word_length > chunk_size:
                chunks.append(" ".join(current_chunk))
                # Keep overlap words for context continuity
                overlap_words = current_chunk[-overlap//10:] if len(current_chunk) > overlap//10 else []
                current_chunk = overlap_words + [word]
                current_length = sum(len(w) + 1 for w in current_chunk)
            else:
                current_chunk.append(word)
                current_length += word_length
        
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        return chunks
    
    def clear(self) -> None:
        """Clear all documents from the collection."""
        try:
            if self._client:
                self._client.delete_collection(self.collection_name)
                self._collection = None
                self._document_count = 0
                logger.info(f"Cleared collection: {self.collection_name}")
        except Exception as e:
            logger.error(f"Failed to clear collection: {e}")
    
    def count(self) -> int:
        """Get the number of items in the collection."""
        try:
            collection = self._get_collection()
            return collection.count()
        except Exception:
            return 0
    
    def get_stats(self) -> dict[str, Any]:
        """Get statistics about the vector store."""
        return {
            "collection_name": self.collection_name,
            "item_count": self.count(),
            "documents_added": self._document_count
        }
