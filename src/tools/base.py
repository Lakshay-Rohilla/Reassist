"""
Base Tool Interface

All tools inherit from this base class to ensure consistent interfaces
and error handling across the agent's capabilities.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class ToolResult:
    """
    Standardized result from tool execution.
    
    Attributes:
        success: Whether the tool executed successfully
        data: The returned data (tool-specific structure)
        error: Error message if success is False
        metadata: Additional information about the execution
    """
    success: bool
    data: Any = None
    error: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


class BaseTool(ABC):
    """
    Abstract base class for all agent tools.
    
    Tools are the agent's interface to external systems (web, databases, etc.)
    Each tool must define its name, description, and execute method.
    """
    
    name: str = "base_tool"
    description: str = "Base tool interface"
    
    @abstractmethod
    async def execute(self, **kwargs) -> ToolResult:
        """
        Execute the tool with the given parameters.
        
        Args:
            **kwargs: Tool-specific parameters
            
        Returns:
            ToolResult with success status and data
        """
        pass
    
    def get_schema(self) -> dict[str, Any]:
        """
        Return JSON schema for LLM function calling.
        
        Override this method to provide specific parameter schemas
        for function/tool calling interfaces.
        """
        return {
            "name": self.name,
            "description": self.description,
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    
    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}: {self.name}>"
