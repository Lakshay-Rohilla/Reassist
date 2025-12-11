"""
Unit tests for the memory module.
"""

import pytest
from src.memory.session import SessionMemory


class TestSessionMemory:
    """Tests for SessionMemory class."""
    
    def test_start_session(self):
        memory = SessionMemory()
        memory.start_session("What are EV battery trends?")
        
        assert memory.question == "What are EV battery trends?"
        assert memory.started_at is not None
        assert len(memory.searches) == 0
    
    def test_add_search(self):
        memory = SessionMemory()
        memory.start_session("Test question")
        
        memory.add_search("test query", [{"title": "Result 1"}])
        
        assert len(memory.searches) == 1
        assert memory.searches[0].query == "test query"
    
    def test_has_searched(self):
        memory = SessionMemory()
        memory.start_session("Test question")
        memory.add_search("EV batteries", [])
        
        assert memory.has_searched("EV batteries") is True
        assert memory.has_searched("ev batteries") is True  # Case insensitive
        assert memory.has_searched("solar panels") is False
    
    def test_add_fetch(self):
        memory = SessionMemory()
        memory.start_session("Test")
        
        memory.add_fetch(
            url="https://example.com",
            title="Example",
            content="This is a long content string..."
        )
        
        assert len(memory.fetches) == 1
        assert memory.fetches[0].url == "https://example.com"
    
    def test_has_fetched(self):
        memory = SessionMemory()
        memory.start_session("Test")
        memory.add_fetch("https://example.com", "Example", "Content")
        
        assert memory.has_fetched("https://example.com") is True
        assert memory.has_fetched("https://other.com") is False
    
    def test_add_fact(self):
        memory = SessionMemory()
        memory.start_session("Test")
        
        memory.add_fact({
            "content": "EV sales grew 50% in 2023",
            "source_url": "https://example.com",
            "type": "statistic",
            "confidence": "high"
        })
        
        assert len(memory.facts) == 1
        assert memory.facts[0].content == "EV sales grew 50% in 2023"
        assert memory.facts[0].confidence == "high"
    
    def test_get_context_summary(self):
        memory = SessionMemory()
        memory.start_session("What are EV trends?")
        memory.add_search("EV trends 2024", [])
        memory.add_fetch("https://example.com", "Test", "Content")
        
        summary = memory.get_context_summary()
        
        assert "What are EV trends?" in summary
        assert "1" in summary  # 1 search
