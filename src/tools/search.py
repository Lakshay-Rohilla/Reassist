"""
Web Search Tool

Provides web search capabilities using the Tavily API (or alternatives).
Tavily is specifically designed for AI agents and returns clean, structured results.
"""

from typing import Any

from src.tools.base import BaseTool, ToolResult
from src.utils.config import Settings
from src.utils.logging import get_logger

logger = get_logger(__name__)


class WebSearchTool(BaseTool):
    """
    Web search tool using Tavily API.
    
    Tavily returns AI-optimized search results with clean snippets
    and relevance scoring, making it ideal for agent use.
    """
    
    name = "web_search"
    description = "Search the web for information on a topic"
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.api_key = settings.tavily_api_key
        self.max_results = settings.max_search_results
        self._client = None
    
    def _get_client(self):
        """Lazy initialization of Tavily client."""
        if self._client is None:
            try:
                from tavily import TavilyClient
                self._client = TavilyClient(api_key=self.api_key)
            except ImportError:
                raise ImportError("tavily-python is required. Install with: pip install tavily-python")
        return self._client
    
    async def execute(self, query: str, **kwargs) -> ToolResult:
        """
        Execute a web search.
        
        Args:
            query: The search query string
            search_depth: "basic" or "advanced" (advanced is more thorough)
            include_domains: List of domains to prioritize
            exclude_domains: List of domains to exclude
            
        Returns:
            ToolResult with search results
        """
        if not query:
            return ToolResult(success=False, error="Query cannot be empty")
        
        search_depth = kwargs.get("search_depth", "basic")
        include_domains = kwargs.get("include_domains", [])
        exclude_domains = kwargs.get("exclude_domains", [])
        
        try:
            client = self._get_client()
            
            # Execute search
            response = client.search(
                query=query,
                search_depth=search_depth,
                max_results=self.max_results,
                include_domains=include_domains if include_domains else None,
                exclude_domains=exclude_domains if exclude_domains else None,
            )
            
            # Parse results
            results = []
            for item in response.get("results", []):
                results.append({
                    "title": item.get("title", ""),
                    "url": item.get("url", ""),
                    "snippet": item.get("content", ""),
                    "score": item.get("score", 0.0),
                })
            
            logger.info(f"Search for '{query}' returned {len(results)} results")
            
            return ToolResult(
                success=True,
                data={
                    "query": query,
                    "results": results,
                    "count": len(results)
                },
                metadata={
                    "search_depth": search_depth,
                    "api": "tavily"
                }
            )
            
        except Exception as e:
            logger.error(f"Search failed for '{query}': {e}")
            return ToolResult(
                success=False,
                error=str(e),
                metadata={"query": query}
            )
    
    def get_schema(self) -> dict[str, Any]:
        """Return JSON schema for function calling."""
        return {
            "name": self.name,
            "description": self.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query"
                    },
                    "search_depth": {
                        "type": "string",
                        "enum": ["basic", "advanced"],
                        "description": "Search depth - advanced is more thorough"
                    }
                },
                "required": ["query"]
            }
        }
