"""
Quality Validator

Validates research quality and identifies issues with citations,
source diversity, and coverage.
"""

from dataclasses import dataclass, field
from typing import Any
from enum import Enum

from src.synthesis.citations import CitationManager, Citation
from src.utils.logging import get_logger

logger = get_logger(__name__)


class QualityLevel(Enum):
    """Quality assessment levels."""
    EXCELLENT = "excellent"
    GOOD = "good"
    ACCEPTABLE = "acceptable"
    NEEDS_IMPROVEMENT = "needs_improvement"
    POOR = "poor"


@dataclass
class QualityIssue:
    """An identified quality issue."""
    category: str
    severity: str  # "high", "medium", "low"
    description: str
    suggestion: str


@dataclass
class QualityReport:
    """Complete quality assessment report."""
    overall_score: float  # 0.0 to 1.0
    overall_level: QualityLevel
    issues: list[QualityIssue] = field(default_factory=list)
    metrics: dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> dict[str, Any]:
        return {
            "overall_score": self.overall_score,
            "overall_level": self.overall_level.value,
            "issues": [
                {"category": i.category, "severity": i.severity, 
                 "description": i.description, "suggestion": i.suggestion}
                for i in self.issues
            ],
            "metrics": self.metrics
        }


class QualityValidator:
    """
    Validates research quality across multiple dimensions.
    
    Checks:
    - Source diversity (different domains, perspectives)
    - Citation coverage (claims supported by sources)
    - Fact density (enough information gathered)
    - Knowledge gap identification
    - Recency of sources
    """
    
    # Thresholds for quality checks
    MIN_SOURCES = 3
    TARGET_SOURCES = 5
    EXCELLENT_SOURCES = 8
    MIN_DOMAINS = 2
    MIN_FACTS = 5
    TARGET_FACTS = 10
    
    def __init__(self):
        self.issues: list[QualityIssue] = []
    
    def validate(
        self,
        facts: list[dict[str, Any]],
        citation_manager: CitationManager,
        report_content: str = ""
    ) -> QualityReport:
        """
        Perform comprehensive quality validation.
        
        Args:
            facts: Extracted facts
            citation_manager: Citation manager with sources
            report_content: Generated report content
            
        Returns:
            QualityReport with scores and issues
        """
        self.issues = []
        
        # Run all checks
        source_score = self._check_source_diversity(citation_manager)
        fact_score = self._check_fact_density(facts)
        citation_score = self._check_citation_coverage(facts, citation_manager)
        gap_score = self._check_knowledge_gaps(facts, report_content)
        
        # Calculate overall score (weighted average)
        weights = {
            "source_diversity": 0.3,
            "fact_density": 0.25,
            "citation_coverage": 0.25,
            "knowledge_gaps": 0.2
        }
        
        overall_score = (
            source_score * weights["source_diversity"] +
            fact_score * weights["fact_density"] +
            citation_score * weights["citation_coverage"] +
            gap_score * weights["knowledge_gaps"]
        )
        
        # Determine quality level
        if overall_score >= 0.85:
            level = QualityLevel.EXCELLENT
        elif overall_score >= 0.7:
            level = QualityLevel.GOOD
        elif overall_score >= 0.5:
            level = QualityLevel.ACCEPTABLE
        elif overall_score >= 0.3:
            level = QualityLevel.NEEDS_IMPROVEMENT
        else:
            level = QualityLevel.POOR
        
        metrics = {
            "source_diversity_score": source_score,
            "fact_density_score": fact_score,
            "citation_coverage_score": citation_score,
            "knowledge_gap_score": gap_score,
            "total_sources": len(citation_manager.get_used_citations()),
            "total_facts": len(facts),
            "unique_domains": len(citation_manager.get_source_diversity().get("domains", []))
        }
        
        return QualityReport(
            overall_score=overall_score,
            overall_level=level,
            issues=self.issues,
            metrics=metrics
        )
    
    def _check_source_diversity(self, citation_manager: CitationManager) -> float:
        """Check for diverse sources from different domains."""
        diversity = citation_manager.get_source_diversity()
        total_sources = diversity.get("total_sources", 0)
        unique_domains = diversity.get("unique_domains", 0)
        
        # Score based on number of sources
        if total_sources >= self.EXCELLENT_SOURCES:
            source_score = 1.0
        elif total_sources >= self.TARGET_SOURCES:
            source_score = 0.8
        elif total_sources >= self.MIN_SOURCES:
            source_score = 0.6
        elif total_sources >= 1:
            source_score = 0.3
        else:
            source_score = 0.0
            self.issues.append(QualityIssue(
                category="source_diversity",
                severity="high",
                description="No sources were used in the research",
                suggestion="Conduct additional searches to gather sources"
            ))
        
        # Adjust for domain diversity
        if total_sources > 0:
            diversity_ratio = unique_domains / total_sources
            if diversity_ratio < 0.5:
                source_score *= 0.8
                self.issues.append(QualityIssue(
                    category="source_diversity",
                    severity="medium",
                    description=f"Limited domain diversity: {unique_domains} unique domains from {total_sources} sources",
                    suggestion="Include sources from different websites and perspectives"
                ))
        
        # Check for minimum domains
        if unique_domains < self.MIN_DOMAINS and total_sources >= self.MIN_SOURCES:
            self.issues.append(QualityIssue(
                category="source_diversity",
                severity="medium",
                description=f"Only {unique_domains} unique domain(s) - consider diversifying",
                suggestion="Search for information from different types of sources (news, academic, industry)"
            ))
        
        return source_score
    
    def _check_fact_density(self, facts: list[dict[str, Any]]) -> float:
        """Check if enough facts were extracted."""
        fact_count = len(facts)
        
        if fact_count >= self.TARGET_FACTS:
            score = 1.0
        elif fact_count >= self.MIN_FACTS:
            score = 0.6 + (fact_count - self.MIN_FACTS) / (self.TARGET_FACTS - self.MIN_FACTS) * 0.4
        elif fact_count >= 2:
            score = 0.3 + (fact_count - 2) / (self.MIN_FACTS - 2) * 0.3
        elif fact_count >= 1:
            score = 0.2
            self.issues.append(QualityIssue(
                category="fact_density",
                severity="high",
                description="Very few facts extracted from sources",
                suggestion="Fetch more source content and analyze for relevant information"
            ))
        else:
            score = 0.0
            self.issues.append(QualityIssue(
                category="fact_density",
                severity="high",
                description="No facts were extracted",
                suggestion="Review source quality and analysis process"
            ))
        
        # Check fact confidence distribution
        high_confidence = sum(1 for f in facts if f.get("confidence") == "high")
        if fact_count > 0 and high_confidence / fact_count < 0.3:
            self.issues.append(QualityIssue(
                category="fact_density",
                severity="low",
                description="Most extracted facts have medium or low confidence",
                suggestion="Seek more authoritative sources for key claims"
            ))
        
        return score
    
    def _check_citation_coverage(
        self, 
        facts: list[dict[str, Any]], 
        citation_manager: CitationManager
    ) -> float:
        """Check that facts are properly attributed to sources."""
        if not facts:
            return 0.5  # Neutral if no facts
        
        facts_with_sources = sum(1 for f in facts if f.get("source_url"))
        coverage = facts_with_sources / len(facts)
        
        if coverage < 0.8:
            self.issues.append(QualityIssue(
                category="citation_coverage",
                severity="medium",
                description=f"Only {facts_with_sources}/{len(facts)} facts have source URLs",
                suggestion="Ensure all extracted facts are linked to their sources"
            ))
        
        # Check if sources are marked as used
        used_citations = citation_manager.get_used_citations()
        if len(used_citations) == 0 and facts_with_sources > 0:
            self.issues.append(QualityIssue(
                category="citation_coverage",
                severity="high",
                description="No sources marked as used despite having facts",
                suggestion="Mark sources as used when extracting facts from them"
            ))
            return 0.3
        
        return min(coverage, 1.0)
    
    def _check_knowledge_gaps(
        self, 
        facts: list[dict[str, Any]], 
        report_content: str
    ) -> float:
        """Check if knowledge gaps are properly identified."""
        # Score based on whether gaps are mentioned
        has_gaps_section = any(term in report_content.lower() for term in [
            "knowledge gap", "limitation", "further research", 
            "not clear", "uncertain", "more research"
        ])
        
        if has_gaps_section:
            score = 1.0
        elif report_content:
            # Penalize slightly if no gaps mentioned in a completed report
            score = 0.7
            self.issues.append(QualityIssue(
                category="knowledge_gaps",
                severity="low",
                description="Report doesn't explicitly identify knowledge gaps",
                suggestion="Add a section noting areas where information is incomplete or uncertain"
            ))
        else:
            score = 0.5  # Neutral if no report yet
        
        return score
    
    def get_improvement_suggestions(self, quality_report: QualityReport) -> list[str]:
        """Get prioritized suggestions for improving research quality."""
        suggestions = []
        
        # Sort issues by severity
        high_issues = [i for i in quality_report.issues if i.severity == "high"]
        medium_issues = [i for i in quality_report.issues if i.severity == "medium"]
        
        for issue in high_issues:
            suggestions.append(f"[HIGH] {issue.suggestion}")
        
        for issue in medium_issues:
            suggestions.append(f"[MEDIUM] {issue.suggestion}")
        
        # Add general suggestions based on scores
        metrics = quality_report.metrics
        
        if metrics.get("source_diversity_score", 1.0) < 0.6:
            suggestions.append("Search for sources from academic, news, and industry perspectives")
        
        if metrics.get("fact_density_score", 1.0) < 0.6:
            suggestions.append("Fetch and analyze more source documents")
        
        return suggestions


def validate_research_quality(
    facts: list[dict[str, Any]],
    citation_manager: CitationManager,
    report_content: str = ""
) -> QualityReport:
    """
    Convenience function to validate research quality.
    
    Args:
        facts: Extracted facts
        citation_manager: Citation manager with sources
        report_content: Generated report content
        
    Returns:
        QualityReport with assessment
    """
    validator = QualityValidator()
    return validator.validate(facts, citation_manager, report_content)
