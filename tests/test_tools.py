"""
Unit tests for the tools module.
"""

import pytest
from src.tools.base import BaseTool, ToolResult


class TestToolResult:
    """Tests for ToolResult dataclass."""
    
    def test_success_result(self):
        result = ToolResult(success=True, data={"key": "value"})
        assert result.success is True
        assert result.data == {"key": "value"}
        assert result.error is None
    
    def test_failure_result(self):
        result = ToolResult(success=False, error="Something went wrong")
        assert result.success is False
        assert result.error == "Something went wrong"
    
    def test_with_metadata(self):
        result = ToolResult(
            success=True,
            data="test",
            metadata={"api": "test", "latency": 100}
        )
        assert result.metadata["api"] == "test"


class MockTool(BaseTool):
    """Mock tool for testing."""
    name = "mock_tool"
    description = "A mock tool for testing"
    
    async def execute(self, **kwargs) -> ToolResult:
        return ToolResult(success=True, data=kwargs)


class TestBaseTool:
    """Tests for BaseTool base class."""
    
    def test_tool_repr(self):
        tool = MockTool()
        assert "MockTool" in repr(tool)
        assert "mock_tool" in repr(tool)
    
    def test_get_schema(self):
        tool = MockTool()
        schema = tool.get_schema()
        assert schema["name"] == "mock_tool"
        assert schema["description"] == "A mock tool for testing"
    
    @pytest.mark.asyncio
    async def test_execute(self):
        tool = MockTool()
        result = await tool.execute(param1="value1")
        assert result.success is True
        assert result.data == {"param1": "value1"}
