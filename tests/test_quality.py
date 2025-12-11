"""
Unit tests for the quality validation module.
"""

import pytest
from src.utils.quality import (
    QualityValidator, 
    QualityReport, 
    QualityLevel,
    QualityIssue,
    validate_research_quality
)
from src.synthesis.citations import CitationManager


class TestQualityValidator:
    """Tests for QualityValidator class."""
    
    def test_validate_with_good_data(self):
        """Test validation with adequate sources and facts."""
        validator = QualityValidator()
        
        # Create citation manager with good diversity
        cm = CitationManager()
        cm.add_potential_source("https://news.example.com/article1", "News Article")
        cm.add_potential_source("https://academic.example.org/paper", "Academic Paper")
        cm.add_potential_source("https://industry.example.net/report", "Industry Report")
        cm.add_potential_source("https://blog.example.io/post", "Blog Post")
        cm.add_potential_source("https://gov.example.gov/data", "Government Data")
        
        for url in ["https://news.example.com/article1", "https://academic.example.org/paper",
                    "https://industry.example.net/report", "https://blog.example.io/post",
                    "https://gov.example.gov/data"]:
            cm.mark_used(url)
        
        # Create facts
        facts = [
            {"content": f"Fact {i}", "source_url": f"https://example{i}.com", 
             "type": "fact", "confidence": "high"}
            for i in range(10)
        ]
        
        report = validator.validate(facts, cm, "Sample report with knowledge gaps mentioned.")
        
        assert report.overall_score >= 0.5
        assert report.overall_level in [QualityLevel.GOOD, QualityLevel.ACCEPTABLE, QualityLevel.EXCELLENT]
    
    def test_validate_with_poor_data(self):
        """Test validation with insufficient sources."""
        validator = QualityValidator()
        
        cm = CitationManager()
        facts = []
        
        report = validator.validate(facts, cm, "")
        
        assert report.overall_score < 0.5
        assert len(report.issues) > 0
        assert any(i.severity == "high" for i in report.issues)
    
    def test_source_diversity_check(self):
        """Test source diversity checking."""
        validator = QualityValidator()
        
        # All from same domain - poor diversity
        cm = CitationManager()
        cm.add_potential_source("https://example.com/page1", "Page 1")
        cm.add_potential_source("https://example.com/page2", "Page 2")
        cm.add_potential_source("https://example.com/page3", "Page 3")
        cm.mark_used("https://example.com/page1")
        cm.mark_used("https://example.com/page2")
        cm.mark_used("https://example.com/page3")
        
        score = validator._check_source_diversity(cm)
        
        # Should be penalized for low domain diversity
        assert score < 1.0
    
    def test_fact_density_check(self):
        """Test fact density checking."""
        validator = QualityValidator()
        
        # Few facts
        facts = [{"content": "Single fact", "confidence": "medium"}]
        score = validator._check_fact_density(facts)
        
        assert score < 0.5
        assert any(i.category == "fact_density" for i in validator.issues)
    
    def test_knowledge_gap_detection(self):
        """Test knowledge gap detection in report."""
        validator = QualityValidator()
        
        # Report with gaps mentioned
        report_with_gaps = """
        ## Summary
        The research found several key points.
        
        ## Knowledge Gaps
        - More research needed on long-term effects
        - Limited data on regional variations
        """
        
        score = validator._check_knowledge_gaps([], report_with_gaps)
        assert score == 1.0
        
        # Report without gaps
        validator.issues = []
        report_no_gaps = "Simple report with no gaps mentioned."
        score = validator._check_knowledge_gaps([], report_no_gaps)
        assert score < 1.0


class TestQualityReport:
    """Tests for QualityReport class."""
    
    def test_to_dict(self):
        """Test dictionary conversion."""
        report = QualityReport(
            overall_score=0.75,
            overall_level=QualityLevel.GOOD,
            issues=[
                QualityIssue(
                    category="test",
                    severity="low",
                    description="Test issue",
                    suggestion="Fix it"
                )
            ],
            metrics={"test_metric": 0.8}
        )
        
        d = report.to_dict()
        
        assert d["overall_score"] == 0.75
        assert d["overall_level"] == "good"
        assert len(d["issues"]) == 1
        assert d["metrics"]["test_metric"] == 0.8


class TestValidateResearchQuality:
    """Tests for the convenience function."""
    
    def test_convenience_function(self):
        """Test the validate_research_quality function."""
        cm = CitationManager()
        cm.add_potential_source("https://example.com", "Example")
        cm.mark_used("https://example.com")
        
        facts = [{"content": "A fact", "source_url": "https://example.com"}]
        
        report = validate_research_quality(facts, cm, "Report content")
        
        assert isinstance(report, QualityReport)
        assert 0.0 <= report.overall_score <= 1.0
