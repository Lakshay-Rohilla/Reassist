"""
Citation Management

Tracks sources and ensures every claim is properly attributed.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any
from urllib.parse import urlparse


@dataclass
class Citation:
    """A source citation with metadata."""
    url: str
    title: str
    snippet: str = ""
    content: str = ""
    accessed_at: datetime = field(default_factory=datetime.now)
    used_in_report: bool = False
    citation_number: int | None = None
    
    @property
    def domain(self) -> str:
        """Extract domain from URL."""
        try:
            parsed = urlparse(self.url)
            return parsed.netloc
        except Exception:
            return "unknown"
    
    def to_reference(self) -> str:
        """Format as a reference entry."""
        date_str = self.accessed_at.strftime("%Y-%m-%d")
        return f"[{self.citation_number}] {self.title}. {self.url} (Accessed: {date_str})"
    
    def to_short_reference(self) -> str:
        """Format as a short inline reference."""
        return f"[{self.citation_number}]"


class CitationManager:
    """
    Manages citations throughout the research process.
    
    Responsibilities:
    - Track all potential sources found during search
    - Mark sources as used when they contribute to the report
    - Generate properly formatted citations
    - Validate that claims are supported by sources
    - Ensure source diversity
    """
    
    def __init__(self):
        self.citations: dict[str, Citation] = {}  # URL -> Citation
        self._next_number = 1
    
    def add_potential_source(
        self, 
        url: str, 
        title: str, 
        snippet: str = ""
    ) -> Citation:
        """
        Add a potential source from search results.
        
        Args:
            url: Source URL
            title: Page title
            snippet: Search result snippet
            
        Returns:
            The created or existing Citation
        """
        if not url:
            return None
            
        if url in self.citations:
            return self.citations[url]
        
        citation = Citation(url=url, title=title, snippet=snippet)
        self.citations[url] = citation
        return citation
    
    def update_source_content(self, url: str, content: str) -> None:
        """Update a source with fully fetched content."""
        if url in self.citations:
            # Store first 5000 chars of content for validation
            self.citations[url].content = content[:5000] if content else ""
    
    def mark_used(self, url: str) -> int | None:
        """
        Mark a source as used in the report.
        
        Args:
            url: Source URL
            
        Returns:
            Citation number assigned
        """
        if url not in self.citations:
            return None
        
        citation = self.citations[url]
        if not citation.used_in_report:
            citation.used_in_report = True
            citation.citation_number = self._next_number
            self._next_number += 1
        
        return citation.citation_number
    
    def get_citation_number(self, url: str) -> int | None:
        """Get the citation number for a URL."""
        citation = self.citations.get(url)
        return citation.citation_number if citation else None
    
    def get_used_citations(self) -> list[Citation]:
        """Get all citations that are used in the report."""
        used = [c for c in self.citations.values() if c.used_in_report]
        return sorted(used, key=lambda c: c.citation_number or 999)
    
    def get_all_citations(self) -> list[Citation]:
        """Get all citations (used and unused)."""
        return list(self.citations.values())
    
    def get_unused_citations(self) -> list[Citation]:
        """Get citations that haven't been used yet."""
        return [c for c in self.citations.values() if not c.used_in_report]
    
    def format_references(self) -> str:
        """Format all used citations as a references section."""
        used = self.get_used_citations()
        if not used:
            return ""
        
        lines = ["## References", ""]
        for citation in used:
            lines.append(citation.to_reference())
        
        return "\n".join(lines)
    
    def validate_claim(self, claim: str, source_url: str) -> bool:
        """
        Validate that a claim appears in the source content.
        
        Args:
            claim: The factual claim to validate
            source_url: URL of the source
            
        Returns:
            True if claim can be traced to source
        """
        citation = self.citations.get(source_url)
        if not citation or not citation.content:
            return False
        
        # Simple keyword overlap check
        claim_words = set(claim.lower().split())
        content_words = set(citation.content.lower().split())
        
        # Remove common words
        stopwords = {"the", "a", "an", "is", "are", "was", "were", "and", "or", "but", "in", "on", "at", "to", "for"}
        claim_words -= stopwords
        
        if not claim_words:
            return True
        
        # Require at least 40% of claim words to appear in content
        overlap = len(claim_words & content_words) / len(claim_words)
        return overlap >= 0.4
    
    def get_source_diversity(self) -> dict[str, Any]:
        """Analyze source diversity."""
        used = self.get_used_citations()
        domains = [c.domain for c in used]
        unique_domains = set(domains)
        
        return {
            "total_sources": len(used),
            "unique_domains": len(unique_domains),
            "domains": list(unique_domains),
            "diversity_score": len(unique_domains) / max(len(used), 1)
        }
    
    def get_sources_summary(self) -> dict[str, Any]:
        """Get a summary of all sources."""
        used = self.get_used_citations()
        return {
            "total_found": len(self.citations),
            "total_used": len(used),
            "sources": [
                {"number": c.citation_number, "title": c.title, "url": c.url, "domain": c.domain}
                for c in used
            ]
        }
