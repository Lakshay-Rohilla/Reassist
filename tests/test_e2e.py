"""
End-to-end integration tests for the research agent.

These tests use mocked API responses to test the full pipeline
without requiring actual API keys.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from dataclasses import dataclass

from src.agent.orchestrator import ResearchOrchestrator, ResearchState
from src.agent.planner import ResearchPlanner, ActionType, AgentAction
from src.synthesis.report import Report, ReportGenerator
from src.synthesis.citations import CitationManager, Citation
from src.memory.session import SessionMemory
from src.utils.config import Settings


class MockLLMClient:
    """Mock LLM client for testing."""
    
    async def generate(self, system: str, user: str, response_format: str = None) -> str:
        """Return mock LLM responses based on context."""
        if "plan" in system.lower() or "next action" in user.lower():
            return '{"action": "complete", "parameters": {}, "reasoning": "Testing complete"}'
        elif "synthesis" in system.lower() or "report" in system.lower():
            return """## Summary
            
This is a mock research report for testing purposes.

## Key Findings

- Finding 1: Mock finding [1]
- Finding 2: Another mock finding [2]

## Knowledge Gaps

- More research needed on testing
"""
        elif "fact" in system.lower() or "extract" in user.lower():
            return '{"facts": [{"content": "Mock fact for testing", "type": "fact", "confidence": "high"}]}'
        elif "queries" in system.lower():
            return '{"queries": ["test query 1", "test query 2"]}'
        else:
            return "Mock response"


class MockSearchTool:
    """Mock search tool."""
    
    async def execute(self, query: str = "", **kwargs):
        @dataclass
        class MockResult:
            success: bool = True
            data: dict = None
            
        return MockResult(
            success=True,
            data={
                "results": [
                    {"url": "https://example.com/1", "title": "Test Result 1", "snippet": "Test snippet 1"},
                    {"url": "https://example.com/2", "title": "Test Result 2", "snippet": "Test snippet 2"},
                ]
            }
        )


class MockFetchTool:
    """Mock fetch tool."""
    
    async def execute(self, url: str = "", **kwargs):
        @dataclass
        class MockResult:
            success: bool = True
            data: dict = None
            
        return MockResult(
            success=True,
            data={
                "content": f"Mock content from {url}. This is test content with enough words to be processed.",
                "title": f"Page from {url}"
            }
        )


class MockAnalyzer:
    """Mock document analyzer."""
    
    async def execute(self, content: str = "", question: str = "", **kwargs):
        @dataclass
        class MockResult:
            success: bool = True
            data: dict = None
            
        return MockResult(
            success=True,
            data={
                "facts": [
                    {"content": "Extracted fact from content", "type": "fact", "confidence": "high"}
                ]
            }
        )


class TestEndToEndResearch:
    """End-to-end tests with mocked dependencies."""
    
    @pytest.fixture
    def mock_settings(self):
        """Create mock settings."""
        settings = MagicMock(spec=Settings)
        settings.max_iterations = 3
        settings.max_cost_per_request = 1.0
        settings.llm_provider = "anthropic"
        settings.tavily_api_key = "mock_key"
        settings.max_search_results = 5
        settings.search_depth = "basic"
        return settings
    
    @pytest.fixture
    def mock_orchestrator(self, mock_settings):
        """Create orchestrator with mocked components."""
        with patch('src.agent.orchestrator.get_llm_client') as mock_llm:
            mock_llm.return_value = MockLLMClient()
            orchestrator = ResearchOrchestrator(mock_settings)
            
            # Replace tools with mocks
            orchestrator.search_tool = MockSearchTool()
            orchestrator.fetch_tool = MockFetchTool()
            orchestrator.analyzer = MockAnalyzer()
            orchestrator.llm = MockLLMClient()
            orchestrator.planner.llm = MockLLMClient()
            orchestrator.report_generator.llm = MockLLMClient()
            
            return orchestrator
    
    @pytest.mark.asyncio
    async def test_research_pipeline(self, mock_orchestrator):
        """Test the full research pipeline with mocks."""
        report = await mock_orchestrator.research("What is machine learning?")
        
        assert report is not None
        assert report.question == "What is machine learning?"
        assert len(report.content) > 0
        assert report.quality_score >= 0
    
    @pytest.mark.asyncio
    async def test_research_extracts_facts(self, mock_orchestrator):
        """Test that research extracts facts."""
        await mock_orchestrator.research("Test question")
        
        # Should have extracted some facts
        assert len(mock_orchestrator.state.facts_extracted) > 0
    
    @pytest.mark.asyncio
    async def test_research_records_searches(self, mock_orchestrator):
        """Test that searches are recorded."""
        await mock_orchestrator.research("Test question")
        
        # Should have performed searches
        assert len(mock_orchestrator.state.searches_performed) > 0


class TestResearchState:
    """Tests for ResearchState dataclass."""
    
    def test_initial_state(self):
        """Test initial state values."""
        state = ResearchState(question="Test")
        
        assert state.question == "Test"
        assert state.iteration == 0
        assert len(state.searches_performed) == 0
        assert len(state.urls_fetched) == 0
        assert len(state.facts_extracted) == 0


class TestSessionMemoryIntegration:
    """Integration tests for session memory."""
    
    def test_full_session_workflow(self):
        """Test complete session memory workflow."""
        memory = SessionMemory()
        
        # Start session
        memory.start_session("What is AI?")
        
        # Add searches
        memory.add_search("artificial intelligence", {"results": []})
        memory.add_search("machine learning basics", {"results": []})
        
        # Add facts
        memory.add_fact({"content": "AI is a branch of CS", "source": "url1"})
        memory.add_fact({"content": "ML is a subset of AI", "source": "url2"})
        
        # Check state
        assert memory.has_searched("artificial intelligence")
        assert not memory.has_searched("deep learning")
        
        # Get summary (returns string)
        summary = memory.get_context_summary()
        assert isinstance(summary, str)
        assert len(summary) > 0


class TestReportExport:
    """Tests for report export functionality."""
    
    def test_markdown_export(self):
        """Test Markdown export."""
        citation = Citation(
            url="https://example.com",
            title="Example",
            citation_number=1
        )
        citation.used_in_report = True
        
        report = Report(
            question="Test question?",
            content="Test content with [1] citation.",
            citations=[citation],
            knowledge_gaps=["Gap 1"],
            quality_score=0.8,
            quality_level="good"
        )
        
        md = report.to_markdown()
        
        assert "# Research Report" in md
        assert "Test question?" in md
        assert "## References" in md
    
    def test_report_with_quality(self):
        """Test report includes quality metrics."""
        report = Report(
            question="Test",
            content="Content",
            quality_score=0.75,
            quality_level="good"
        )
        
        assert report.quality_score == 0.75
        assert report.quality_level == "good"
