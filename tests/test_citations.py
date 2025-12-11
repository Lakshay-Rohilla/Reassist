"""
Unit tests for the citations module.
"""

import pytest
from src.synthesis.citations import CitationManager, Citation


class TestCitation:
    """Tests for Citation dataclass."""
    
    def test_citation_creation(self):
        citation = Citation(
            url="https://example.com/article",
            title="Test Article",
            snippet="This is a test snippet"
        )
        
        assert citation.url == "https://example.com/article"
        assert citation.title == "Test Article"
        assert citation.used_in_report is False
    
    def test_to_reference(self):
        citation = Citation(
            url="https://example.com",
            title="Test Article"
        )
        citation.citation_number = 1
        
        ref = citation.to_reference()
        
        assert "[1]" in ref
        assert "Test Article" in ref
        assert "https://example.com" in ref


class TestCitationManager:
    """Tests for CitationManager class."""
    
    def test_add_potential_source(self):
        manager = CitationManager()
        
        citation = manager.add_potential_source(
            url="https://example.com",
            title="Test",
            snippet="Snippet"
        )
        
        assert citation.url == "https://example.com"
        assert len(manager.citations) == 1
    
    def test_no_duplicate_sources(self):
        manager = CitationManager()
        
        manager.add_potential_source("https://example.com", "Test 1")
        manager.add_potential_source("https://example.com", "Test 2")
        
        assert len(manager.citations) == 1
    
    def test_mark_used(self):
        manager = CitationManager()
        manager.add_potential_source("https://example.com", "Test")
        
        num = manager.mark_used("https://example.com")
        
        assert num == 1
        assert manager.citations["https://example.com"].used_in_report is True
    
    def test_get_used_citations(self):
        manager = CitationManager()
        manager.add_potential_source("https://a.com", "A")
        manager.add_potential_source("https://b.com", "B")
        manager.add_potential_source("https://c.com", "C")
        
        manager.mark_used("https://a.com")
        manager.mark_used("https://c.com")
        
        used = manager.get_used_citations()
        
        assert len(used) == 2
        assert used[0].url == "https://a.com"  # First marked
        assert used[1].url == "https://c.com"  # Second marked
    
    def test_format_references(self):
        manager = CitationManager()
        manager.add_potential_source("https://example.com", "Test Article")
        manager.mark_used("https://example.com")
        
        refs = manager.format_references()
        
        assert "## References" in refs
        assert "[1]" in refs
        assert "Test Article" in refs
    
    def test_update_source_content(self):
        manager = CitationManager()
        manager.add_potential_source("https://example.com", "Test")
        manager.update_source_content("https://example.com", "Full content here")
        
        assert manager.citations["https://example.com"].content == "Full content here"
