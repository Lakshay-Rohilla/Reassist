"""
Configuration Management

Centralized configuration using Pydantic settings with
environment variable support and validation.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Copy .env.example to .env and fill in your API keys.
    """
    
    # LLM Configuration
    anthropic_api_key: str = Field(default="", description="Anthropic API key for Claude")
    openai_api_key: str = Field(default="", description="OpenAI API key for GPT-4")
    google_api_key: str = Field(default="", description="Google API key for Gemini")
    
    llm_provider: str = Field(
        default="anthropic",
        description="LLM provider: 'anthropic', 'openai', or 'google'"
    )
    llm_model: str = Field(
        default="claude-3-5-sonnet-20241022",
        description="Model name to use"
    )
    
    # Search Configuration
    tavily_api_key: str = Field(default="", description="Tavily API key for web search")
    search_provider: str = Field(default="tavily", description="Search provider to use")
    max_search_results: int = Field(default=10, ge=1, le=50)
    
    # Agent Configuration
    max_iterations: int = Field(
        default=10,
        ge=1,
        le=50,
        description="Maximum research iterations per question"
    )
    max_sources_per_report: int = Field(
        default=15,
        ge=5,
        le=50,
        description="Maximum sources to include in report"
    )
    
    # Cost Limits
    max_cost_per_request: float = Field(
        default=2.0,
        ge=0.1,
        description="Maximum cost per research request in USD"
    )
    
    # Logging
    log_level: str = Field(default="INFO", description="Logging level")
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }
    
    def get_active_llm_key(self) -> str:
        """Get the API key for the configured LLM provider."""
        keys = {
            "anthropic": self.anthropic_api_key,
            "openai": self.openai_api_key,
            "google": self.google_api_key,
        }
        # Normalize provider name to lowercase
        return keys.get(self.llm_provider.lower(), "")
    
    def validate_config(self) -> list[str]:
        """Validate configuration and return any errors."""
        errors = []
        
        if not self.get_active_llm_key():
            errors.append(f"Missing API key for {self.llm_provider}")
        
        if not self.tavily_api_key:
            errors.append("Missing Tavily API key for web search")
        
        return errors


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.
    
    Uses lru_cache to ensure settings are loaded only once.
    """
    return Settings()
