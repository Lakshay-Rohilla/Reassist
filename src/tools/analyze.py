"""
Document Analyzer Tool

Uses LLM to extract structured information from document content,
identifying key facts, statistics, and claims relevant to the research.
"""

import json
from typing import Any

from src.agent.prompts import FACT_EXTRACTION_PROMPT
from src.tools.base import BaseTool, ToolResult
from src.utils.logging import get_logger

logger = get_logger(__name__)

# Maximum content length to analyze at once
MAX_CHUNK_SIZE = 8000  # characters


class DocumentAnalyzer(BaseTool):
    """
    Analyzes document content to extract relevant facts.
    
    Uses the LLM to identify key information from fetched content,
    categorizing facts by type and relevance.
    """
    
    name = "document_analyzer"
    description = "Extract key facts and information from document content"
    
    def __init__(self, llm):
        self.llm = llm
    
    async def execute(self, content: str, question: str, **kwargs) -> ToolResult:
        """
        Analyze document content to extract relevant facts.
        
        Args:
            content: The document text to analyze
            question: The research question (for relevance filtering)
            
        Returns:
            ToolResult with extracted facts
        """
        if not content:
            return ToolResult(success=False, error="Content cannot be empty")
        
        if not question:
            return ToolResult(success=False, error="Question is required for analysis")
        
        try:
            # Chunk content if too long
            chunks = self._chunk_content(content)
            all_facts = []
            
            for i, chunk in enumerate(chunks):
                logger.info(f"Analyzing chunk {i+1}/{len(chunks)}")
                
                facts = await self._analyze_chunk(chunk, question)
                all_facts.extend(facts)
            
            # Deduplicate similar facts
            unique_facts = self._deduplicate_facts(all_facts)
            
            logger.info(f"Extracted {len(unique_facts)} unique facts")
            
            return ToolResult(
                success=True,
                data={
                    "facts": unique_facts,
                    "total_chunks": len(chunks),
                    "facts_count": len(unique_facts)
                }
            )
            
        except Exception as e:
            logger.error(f"Document analysis failed: {e}")
            return ToolResult(success=False, error=str(e))
    
    def _chunk_content(self, content: str) -> list[str]:
        """Split content into analyzable chunks."""
        if len(content) <= MAX_CHUNK_SIZE:
            return [content]
        
        chunks = []
        words = content.split()
        current_chunk = []
        current_length = 0
        
        for word in words:
            word_length = len(word) + 1  # +1 for space
            if current_length + word_length > MAX_CHUNK_SIZE:
                chunks.append(" ".join(current_chunk))
                current_chunk = [word]
                current_length = word_length
            else:
                current_chunk.append(word)
                current_length += word_length
        
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        return chunks
    
    async def _analyze_chunk(self, content: str, question: str) -> list[dict[str, Any]]:
        """Analyze a single content chunk."""
        prompt = FACT_EXTRACTION_PROMPT.format(
            question=question,
            content=content
        )
        
        try:
            response = await self.llm.generate(
                system="You are a fact extraction assistant. Extract structured facts from content.",
                user=prompt,
                response_format="json"
            )
            
            # Parse response
            data = json.loads(response)
            return data.get("facts", [])
            
        except json.JSONDecodeError:
            logger.warning("Failed to parse fact extraction response")
            return []
        except Exception as e:
            logger.error(f"Chunk analysis failed: {e}")
            return []
    
    def _deduplicate_facts(self, facts: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Remove duplicate or very similar facts."""
        if not facts:
            return []
        
        unique = []
        seen_content = set()
        
        for fact in facts:
            content = fact.get("content", "").lower().strip()
            # Simple dedup: check if first 50 chars are seen
            key = content[:50]
            
            if key not in seen_content:
                seen_content.add(key)
                unique.append(fact)
        
        return unique
    
    def get_schema(self) -> dict[str, Any]:
        """Return JSON schema for function calling."""
        return {
            "name": self.name,
            "description": self.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "content": {
                        "type": "string",
                        "description": "The document content to analyze"
                    },
                    "question": {
                        "type": "string",
                        "description": "The research question for relevance filtering"
                    }
                },
                "required": ["content", "question"]
            }
        }
