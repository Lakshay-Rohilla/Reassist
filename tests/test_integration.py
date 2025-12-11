"""
Integration tests for the research agent.

These tests require API keys to be configured.
Run with: pytest tests/test_integration.py -v --integration
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

from src.agent.orchestrator import ResearchOrchestrator
from src.agent.planner import ResearchPlanner, ActionType, AgentAction
from src.synthesis.report import Report, ReportGenerator
from src.synthesis.citations import CitationManager, Citation
from src.utils.config import Settings


# Skip if no API keys
def skip_without_keys():
    settings = Settings()
    errors = settings.validate_config()
    if errors:
        return pytest.mark.skip(reason="API keys not configured")
    return lambda x: x


class TestResearchPlanner:
    """Tests for the ResearchPlanner."""
    
    @pytest.mark.asyncio
    async def test_should_complete_with_enough_data(self):
        """Planner should signal completion when enough data gathered."""
        mock_llm = MagicMock()
        planner = ResearchPlanner(mock_llm)
        
        context = {
            "original_question": "Test question",
            "searches_performed": ["query1", "query2"],
            "urls_fetched": ["url1", "url2", "url3", "url4", "url5"],
            "facts_count": 15,
            "facts_summary": "Many facts",
            "iteration": 5,
            "max_iterations": 10,
            "sources_count": 8,
            "pending_urls": []
        }
        
        # Should complete due to enough sources and facts
        assert planner._should_complete(context) is True
    
    @pytest.mark.asyncio
    async def test_should_not_complete_early(self):
        """Planner should not complete too early."""
        mock_llm = MagicMock()
        planner = ResearchPlanner(mock_llm)
        
        context = {
            "original_question": "Test question",
            "searches_performed": ["query1"],
            "urls_fetched": ["url1"],
            "facts_count": 2,
            "facts_summary": "Few facts",
            "iteration": 2,
            "max_iterations": 10,
            "sources_count": 2,
            "pending_urls": []
        }
        
        assert planner._should_complete(context) is False
    
    @pytest.mark.asyncio
    async def test_prioritize_pending_urls(self):
        """Planner should fetch pending URLs when available."""
        mock_llm = MagicMock()
        planner = ResearchPlanner(mock_llm)
        
        context = {
            "original_question": "Test question",
            "searches_performed": ["query1"],
            "urls_fetched": ["url1"],
            "facts_count": 2,
            "facts_summary": "Some facts",
            "iteration": 2,
            "max_iterations": 10,
            "sources_count": 2,
            "pending_urls": ["https://example.com/article"]
        }
        
        action = await planner.plan_next_action(context)
        
        assert action.type == ActionType.FETCH
        assert action.parameters.get("url") == "https://example.com/article"


class TestCitationManagerIntegration:
    """Integration tests for citation management."""
    
    def test_full_citation_workflow(self):
        """Test complete citation workflow from search to report."""
        manager = CitationManager()
        
        # Add sources from search
        manager.add_potential_source(
            "https://example.com/article1",
            "Article 1",
            "First article about topic"
        )
        manager.add_potential_source(
            "https://other.com/article2",
            "Article 2",
            "Second article about topic"
        )
        
        # Update with fetched content
        manager.update_source_content(
            "https://example.com/article1",
            "Full content of article 1 with lots of details..."
        )
        
        # Mark as used
        num1 = manager.mark_used("https://example.com/article1")
        num2 = manager.mark_used("https://other.com/article2")
        
        assert num1 == 1
        assert num2 == 2
        
        # Check diversity
        diversity = manager.get_source_diversity()
        assert diversity["total_sources"] == 2
        assert diversity["unique_domains"] == 2
        
        # Format references
        refs = manager.format_references()
        assert "[1]" in refs
        assert "[2]" in refs
        assert "Article 1" in refs


class TestReportGeneration:
    """Tests for report generation."""
    
    @pytest.mark.asyncio
    async def test_fallback_report(self):
        """Test fallback report generation when LLM fails."""
        mock_llm = AsyncMock()
        mock_llm.generate.side_effect = Exception("API Error")
        
        generator = ReportGenerator(mock_llm)
        
        facts = [
            {"content": "Fact 1 about the topic", "type": "fact", "confidence": "high"},
            {"content": "Fact 2 about the topic", "type": "statistic", "confidence": "medium"}
        ]
        citations = []
        
        report = await generator.generate(
            question="Test question",
            facts=facts,
            citations=citations
        )
        
        assert report.question == "Test question"
        assert "Fact 1" in report.content
        assert len(report.knowledge_gaps) > 0


class TestReport:
    """Tests for Report class."""
    
    def test_to_markdown(self):
        """Test markdown export."""
        citations = [
            Citation(url="https://example.com", title="Example", citation_number=1)
        ]
        citations[0].used_in_report = True
        
        report = Report(
            question="What is AI?",
            content="AI is artificial intelligence [1].",
            citations=citations,
            knowledge_gaps=["More research needed on ethics"]
        )
        
        md = report.to_markdown()
        
        assert "# Research Report" in md
        assert "What is AI?" in md
        assert "AI is artificial intelligence" in md
        assert "## Knowledge Gaps" in md
        assert "## References" in md
        assert "[1]" in md
