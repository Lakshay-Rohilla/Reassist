"""
LLM Client Abstraction

Provides a unified interface for different LLM providers (Anthropic, OpenAI, Google).
"""

from abc import ABC, abstractmethod
from typing import Any

from src.utils.config import Settings
from src.utils.logging import get_logger

logger = get_logger(__name__)


class BaseLLMClient(ABC):
    """Abstract base class for LLM clients."""
    
    @abstractmethod
    async def generate(
        self,
        system: str,
        user: str,
        response_format: str | None = None,
        **kwargs
    ) -> str:
        """Generate a response from the LLM."""
        pass
    
    @abstractmethod
    def count_tokens(self, text: str) -> int:
        """Count tokens in text."""
        pass


class AnthropicClient(BaseLLMClient):
    """Client for Anthropic's Claude API."""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self._client = None
    
    def _get_client(self):
        if self._client is None:
            try:
                from anthropic import AsyncAnthropic
                self._client = AsyncAnthropic(api_key=self.settings.anthropic_api_key)
            except ImportError:
                raise ImportError("anthropic is required. Install with: pip install anthropic")
        return self._client
    
    async def generate(
        self,
        system: str,
        user: str,
        response_format: str | None = None,
        **kwargs
    ) -> str:
        client = self._get_client()
        
        try:
            response = await client.messages.create(
                model=self.settings.llm_model,
                max_tokens=4096,
                system=system,
                messages=[{"role": "user", "content": user}]
            )
            
            return response.content[0].text
            
        except Exception as e:
            logger.error(f"Anthropic API error: {e}")
            raise
    
    def count_tokens(self, text: str) -> int:
        # Rough estimate: ~4 chars per token
        return len(text) // 4


class OpenAIClient(BaseLLMClient):
    """Client for OpenAI's API."""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self._client = None
    
    def _get_client(self):
        if self._client is None:
            try:
                from openai import AsyncOpenAI
                self._client = AsyncOpenAI(api_key=self.settings.openai_api_key)
            except ImportError:
                raise ImportError("openai is required. Install with: pip install openai")
        return self._client
    
    async def generate(
        self,
        system: str,
        user: str,
        response_format: str | None = None,
        **kwargs
    ) -> str:
        client = self._get_client()
        
        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ]
        
        create_kwargs: dict[str, Any] = {
            "model": self.settings.llm_model,
            "messages": messages,
            "max_tokens": 4096,
        }
        
        if response_format == "json":
            create_kwargs["response_format"] = {"type": "json_object"}
        
        try:
            response = await client.chat.completions.create(**create_kwargs)
            return response.choices[0].message.content or ""
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise
    
    def count_tokens(self, text: str) -> int:
        return len(text) // 4


class GoogleClient(BaseLLMClient):
    """Client for Google's Gemini API."""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self._client = None
    
    def _get_client(self):
        if self._client is None:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.settings.google_api_key)
                self._client = genai.GenerativeModel(self.settings.llm_model)
            except ImportError:
                raise ImportError("google-generativeai is required. Install with: pip install google-generativeai")
        return self._client
    
    async def generate(
        self,
        system: str,
        user: str,
        response_format: str | None = None,
        **kwargs
    ) -> str:
        model = self._get_client()
        
        prompt = f"{system}\n\n{user}"
        
        try:
            response = await model.generate_content_async(prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Google API error: {e}")
            raise
    
    def count_tokens(self, text: str) -> int:
        return len(text) // 4


def get_llm_client(settings: Settings) -> BaseLLMClient:
    """
    Factory function to get the appropriate LLM client.
    
    Args:
        settings: Application settings
        
    Returns:
        An LLM client instance
    """
    provider = settings.llm_provider.lower()
    
    clients = {
        "anthropic": AnthropicClient,
        "openai": OpenAIClient,
        "google": GoogleClient,
    }
    
    client_class = clients.get(provider)
    if not client_class:
        raise ValueError(f"Unknown LLM provider: {provider}")
    
    return client_class(settings)
