"""
Content Fetch Tool

Fetches and extracts clean text content from web pages.
Uses trafilatura for high-quality content extraction.
"""

import asyncio
from typing import Any
from urllib.parse import urlparse

import httpx

from src.tools.base import BaseTool, ToolResult
from src.utils.logging import get_logger

logger = get_logger(__name__)

# Request configuration
DEFAULT_TIMEOUT = 30.0
MAX_CONTENT_SIZE = 5 * 1024 * 1024  # 5MB max
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


class ContentFetchTool(BaseTool):
    """
    Fetches web page content and extracts clean text.
    
    Uses trafilatura for content extraction, which is specifically
    designed to extract article content while removing navigation,
    ads, and other boilerplate.
    """
    
    name = "content_fetch"
    description = "Fetch and extract content from a web page"
    
    def __init__(self, timeout: float = DEFAULT_TIMEOUT):
        self.timeout = timeout
        self._client = None
    
    def _get_client(self) -> httpx.AsyncClient:
        """Lazy initialization of HTTP client."""
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=self.timeout,
                follow_redirects=True,
                headers={"User-Agent": USER_AGENT}
            )
        return self._client
    
    async def execute(self, url: str, **kwargs) -> ToolResult:
        """
        Fetch and extract content from a URL.
        
        Args:
            url: The URL to fetch
            include_links: Whether to preserve links in extracted text
            include_tables: Whether to preserve tables
            
        Returns:
            ToolResult with extracted content
        """
        if not url:
            return ToolResult(success=False, error="URL cannot be empty")
        
        # Validate URL
        try:
            parsed = urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                return ToolResult(success=False, error=f"Invalid URL: {url}")
        except Exception:
            return ToolResult(success=False, error=f"Invalid URL: {url}")
        
        include_links = kwargs.get("include_links", False)
        include_tables = kwargs.get("include_tables", True)
        
        try:
            # Fetch the page
            client = self._get_client()
            response = await client.get(url)
            response.raise_for_status()
            
            # Check content size
            content_length = len(response.content)
            if content_length > MAX_CONTENT_SIZE:
                return ToolResult(
                    success=False, 
                    error=f"Content too large: {content_length} bytes"
                )
            
            # Extract content using trafilatura
            html_content = response.text
            extracted = await self._extract_content(
                html_content,
                url=url,
                include_links=include_links,
                include_tables=include_tables
            )
            
            if not extracted["content"]:
                return ToolResult(
                    success=False,
                    error="Could not extract meaningful content from page"
                )
            
            logger.info(f"Fetched {url}: {len(extracted['content'])} chars")
            
            return ToolResult(
                success=True,
                data={
                    "url": url,
                    "title": extracted["title"],
                    "content": extracted["content"],
                    "author": extracted.get("author"),
                    "date": extracted.get("date"),
                    "word_count": len(extracted["content"].split())
                },
                metadata={
                    "content_type": response.headers.get("content-type", ""),
                    "status_code": response.status_code
                }
            )
            
        except httpx.TimeoutException:
            logger.warning(f"Timeout fetching {url}")
            return ToolResult(success=False, error=f"Timeout fetching URL: {url}")
            
        except httpx.HTTPStatusError as e:
            logger.warning(f"HTTP error {e.response.status_code} for {url}")
            return ToolResult(
                success=False, 
                error=f"HTTP {e.response.status_code}: {url}"
            )
            
        except Exception as e:
            logger.error(f"Failed to fetch {url}: {e}")
            return ToolResult(success=False, error=str(e))
    
    async def _extract_content(
        self, 
        html: str, 
        url: str,
        include_links: bool,
        include_tables: bool
    ) -> dict[str, Any]:
        """
        Extract clean content from HTML using trafilatura.
        
        Runs in a thread pool to avoid blocking the event loop
        since trafilatura is synchronous.
        """
        def _sync_extract():
            try:
                import trafilatura
                from trafilatura.settings import use_config
                
                # Configure extraction
                config = use_config()
                config.set("DEFAULT", "INCLUDE_LINKS", str(include_links))
                config.set("DEFAULT", "INCLUDE_TABLES", str(include_tables))
                
                # Extract content
                content = trafilatura.extract(
                    html,
                    url=url,
                    include_links=include_links,
                    include_tables=include_tables,
                    include_comments=False,
                    output_format="txt",
                    config=config
                )
                
                # Get metadata
                metadata = trafilatura.extract_metadata(html)
                
                return {
                    "content": content or "",
                    "title": metadata.title if metadata else "",
                    "author": metadata.author if metadata else None,
                    "date": metadata.date if metadata else None,
                }
                
            except ImportError:
                # Fallback to basic BeautifulSoup extraction
                return self._fallback_extract(html)
        
        # Run synchronous extraction in thread pool
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _sync_extract)
    
    def _fallback_extract(self, html: str) -> dict[str, Any]:
        """Fallback extraction using BeautifulSoup."""
        try:
            from bs4 import BeautifulSoup
            
            soup = BeautifulSoup(html, "lxml")
            
            # Remove script and style elements
            for element in soup(["script", "style", "nav", "footer", "header"]):
                element.decompose()
            
            # Extract title
            title = ""
            if soup.title:
                title = soup.title.string or ""
            
            # Extract text
            text = soup.get_text(separator="\n", strip=True)
            
            return {
                "content": text,
                "title": title,
                "author": None,
                "date": None,
            }
            
        except Exception:
            return {"content": "", "title": "", "author": None, "date": None}
    
    async def close(self):
        """Close the HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None
    
    def get_schema(self) -> dict[str, Any]:
        """Return JSON schema for function calling."""
        return {
            "name": self.name,
            "description": self.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "The URL to fetch content from"
                    }
                },
                "required": ["url"]
            }
        }
