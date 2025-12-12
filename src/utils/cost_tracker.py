"""
Cost Tracker

Monitors API usage costs across LLM and search operations.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


# Approximate token costs per provider (as of late 2024)
# These may change - check provider pricing pages
COST_PER_1K_TOKENS = {
    "anthropic": {
        "claude-3-5-sonnet-20241022": {"input": 0.003, "output": 0.015},
        "claude-3-opus-20240229": {"input": 0.015, "output": 0.075},
        "claude-3-haiku-20240307": {"input": 0.00025, "output": 0.00125},
    },
    "openai": {
        "gpt-4-turbo": {"input": 0.01, "output": 0.03},
        "gpt-4o": {"input": 0.005, "output": 0.015},
        "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
    },
    "google": {
        "gemini-2.5-pro": {"input": 0.00125, "output": 0.005},
        "gemini-2.5-flash": {"input": 0.000075, "output": 0.0003},
    }
}

# Search API costs
SEARCH_COSTS = {
    "tavily": 0.01,  # Approximate per search
}


@dataclass
class UsageRecord:
    """Record of a single API call."""
    service: str
    model: str
    input_tokens: int = 0
    output_tokens: int = 0
    cost: float = 0.0
    timestamp: datetime = field(default_factory=datetime.now)


class CostTracker:
    """
    Tracks API costs throughout a research session.
    
    Helps prevent runaway costs and provides transparency
    to users about resource usage.
    """
    
    def __init__(self):
        self.records: list[UsageRecord] = []
        self.total_cost: float = 0.0
    
    def record_llm_usage(
        self,
        provider: str,
        model: str,
        input_tokens: int,
        output_tokens: int
    ) -> float:
        """
        Record LLM API usage.
        
        Args:
            provider: LLM provider name
            model: Model name
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            
        Returns:
            Cost of this call
        """
        cost = self._calculate_llm_cost(provider, model, input_tokens, output_tokens)
        
        record = UsageRecord(
            service=f"{provider}/{model}",
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost=cost
        )
        
        self.records.append(record)
        self.total_cost += cost
        
        return cost
    
    def record_search_usage(self, provider: str, num_searches: int = 1) -> float:
        """
        Record search API usage.
        
        Args:
            provider: Search provider name
            num_searches: Number of searches performed
            
        Returns:
            Cost of this call
        """
        cost_per_search = SEARCH_COSTS.get(provider, 0.01)
        cost = cost_per_search * num_searches
        
        record = UsageRecord(
            service=f"search/{provider}",
            model=provider,
            cost=cost
        )
        
        self.records.append(record)
        self.total_cost += cost
        
        return cost
    
    def _calculate_llm_cost(
        self,
        provider: str,
        model: str,
        input_tokens: int,
        output_tokens: int
    ) -> float:
        """Calculate cost for LLM usage."""
        provider_models = COST_PER_1K_TOKENS.get(provider, {})
        model_costs = provider_models.get(model, {"input": 0.01, "output": 0.03})
        
        input_cost = (input_tokens / 1000) * model_costs["input"]
        output_cost = (output_tokens / 1000) * model_costs["output"]
        
        return input_cost + output_cost
    
    def get_summary(self) -> dict[str, Any]:
        """Get a summary of all costs."""
        by_service: dict[str, float] = {}
        total_input_tokens = 0
        total_output_tokens = 0
        
        for record in self.records:
            by_service[record.service] = by_service.get(record.service, 0) + record.cost
            total_input_tokens += record.input_tokens
            total_output_tokens += record.output_tokens
        
        return {
            "total_cost": self.total_cost,
            "total_calls": len(self.records),
            "total_input_tokens": total_input_tokens,
            "total_output_tokens": total_output_tokens,
            "by_service": by_service
        }
    
    def reset(self) -> None:
        """Reset the cost tracker."""
        self.records.clear()
        self.total_cost = 0.0
