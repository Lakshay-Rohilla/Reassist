"""
Session Memory

Maintains short-term memory for the current research session,
tracking searches, fetched content, and extracted facts.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class SearchRecord:
    """Record of a search operation."""
    query: str
    results: list[dict[str, Any]]
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class FetchRecord:
    """Record of a content fetch operation."""
    url: str
    title: str
    content_preview: str  # First 500 chars
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class FactRecord:
    """Record of an extracted fact."""
    content: str
    source_url: str
    fact_type: str
    confidence: str
    timestamp: datetime = field(default_factory=datetime.now)


class SessionMemory:
    """
    Manages short-term memory for a research session.
    
    Tracks:
    - Research question and follow-ups
    - Search queries and their results
    - Fetched URLs and content summaries
    - Extracted facts
    
    This enables the agent to:
    - Avoid duplicate searches
    - Track what sources have been visited
    - Maintain context for synthesis
    """
    
    def __init__(self):
        self.question: str = ""
        self.follow_ups: list[str] = []
        self.searches: list[SearchRecord] = []
        self.fetches: list[FetchRecord] = []
        self.facts: list[FactRecord] = []
        self.started_at: datetime | None = None
    
    def start_session(self, question: str) -> None:
        """Initialize a new research session."""
        self.question = question
        self.follow_ups = []
        self.searches = []
        self.fetches = []
        self.facts = []
        self.started_at = datetime.now()
    
    def add_follow_up(self, question: str) -> None:
        """Add a follow-up question to the session."""
        self.follow_ups.append(question)
    
    def add_search(self, query: str, results: list[dict[str, Any]]) -> None:
        """Record a search operation."""
        self.searches.append(SearchRecord(query=query, results=results))
    
    def add_fetch(self, url: str, title: str, content: str) -> None:
        """Record a content fetch operation."""
        preview = content[:500] + "..." if len(content) > 500 else content
        self.fetches.append(FetchRecord(url=url, title=title, content_preview=preview))
    
    def add_fact(self, fact: dict[str, Any]) -> None:
        """Record an extracted fact."""
        self.facts.append(FactRecord(
            content=fact.get("content", ""),
            source_url=fact.get("source_url", ""),
            fact_type=fact.get("type", "unknown"),
            confidence=fact.get("confidence", "medium")
        ))
    
    def get_searched_queries(self) -> list[str]:
        """Get list of all searched queries."""
        return [s.query for s in self.searches]
    
    def get_fetched_urls(self) -> list[str]:
        """Get list of all fetched URLs."""
        return [f.url for f in self.fetches]
    
    def has_searched(self, query: str) -> bool:
        """Check if a query has already been searched."""
        return query.lower() in [s.query.lower() for s in self.searches]
    
    def has_fetched(self, url: str) -> bool:
        """Check if a URL has already been fetched."""
        return url in self.get_fetched_urls()
    
    def get_context_summary(self) -> str:
        """Generate a summary of current session state."""
        return f"""
Session Summary:
- Question: {self.question}
- Follow-ups: {len(self.follow_ups)}
- Searches: {len(self.searches)}
- Sources fetched: {len(self.fetches)}
- Facts extracted: {len(self.facts)}
- Duration: {self._get_duration()}
"""
    
    def _get_duration(self) -> str:
        """Calculate session duration."""
        if not self.started_at:
            return "N/A"
        delta = datetime.now() - self.started_at
        minutes = delta.seconds // 60
        seconds = delta.seconds % 60
        return f"{minutes}m {seconds}s"
    
    def get_all_facts(self) -> list[dict[str, Any]]:
        """Get all facts as dictionaries."""
        return [
            {
                "content": f.content,
                "source_url": f.source_url,
                "type": f.fact_type,
                "confidence": f.confidence
            }
            for f in self.facts
        ]
