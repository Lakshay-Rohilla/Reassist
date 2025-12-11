"""
Report Generator

Synthesizes research findings into structured, well-cited reports.
"""

from dataclasses import dataclass, field
from typing import Any

from src.agent.prompts import SYNTHESIS_PROMPT, FOLLOW_UP_PROMPT
from src.synthesis.citations import Citation
from src.utils.logging import get_logger

logger = get_logger(__name__)


@dataclass
class Report:
    """A generated research report."""
    question: str
    content: str
    citations: list[Citation] = field(default_factory=list)
    knowledge_gaps: list[str] = field(default_factory=list)
    total_cost: float = 0.0
    quality_score: float = 0.0
    quality_level: str = ""
    
    def to_markdown(self) -> str:
        """Export report as Markdown."""
        lines = [
            f"# Research Report",
            f"",
            f"**Question:** {self.question}",
            f"",
            self.content,
            f"",
        ]
        
        if self.knowledge_gaps:
            lines.extend([
                "## Knowledge Gaps",
                "",
            ])
            for gap in self.knowledge_gaps:
                lines.append(f"- {gap}")
            lines.append("")
        
        if self.citations:
            lines.extend([
                "## References",
                "",
            ])
            for citation in self.citations:
                lines.append(citation.to_reference())
        
        return "\n".join(lines)
    
    def save(self, filepath: str) -> None:
        """Save report to a file."""
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(self.to_markdown())


class ReportGenerator:
    """
    Generates structured research reports from extracted facts.
    
    Uses the LLM to:
    - Synthesize facts into coherent narratives
    - Organize content by themes
    - Ensure proper citations
    - Identify knowledge gaps
    """
    
    def __init__(self, llm):
        self.llm = llm
    
    async def generate(
        self,
        question: str,
        facts: list[dict[str, Any]],
        citations: list[Citation]
    ) -> Report:
        """
        Generate a comprehensive research report.
        
        Args:
            question: The original research question
            facts: List of extracted facts with sources
            citations: List of used citations
            
        Returns:
            A structured Report
        """
        logger.info(f"Generating report with {len(facts)} facts and {len(citations)} citations")
        
        # Format facts for the prompt
        facts_text = self._format_facts(facts, citations)
        
        # Format sources for the prompt
        sources_text = self._format_sources(citations)
        
        # Generate report via LLM
        prompt = SYNTHESIS_PROMPT.format(
            question=question,
            facts=facts_text,
            sources=sources_text
        )
        
        try:
            content = await self.llm.generate(
                system="You are a research report writer. Create comprehensive, well-cited reports. Use [1], [2] style inline citations.",
                user=prompt
            )
            
            # Extract knowledge gaps from content
            gaps = self._extract_knowledge_gaps(content)
            
            return Report(
                question=question,
                content=content,
                citations=citations,
                knowledge_gaps=gaps
            )
            
        except Exception as e:
            logger.error(f"Report generation failed: {e}")
            # Generate a basic report from facts
            return self._generate_fallback_report(question, facts, citations)
    
    def _generate_fallback_report(
        self,
        question: str,
        facts: list[dict[str, Any]],
        citations: list[Citation]
    ) -> Report:
        """Generate a basic report when LLM fails."""
        lines = [
            f"## Summary",
            f"",
            f"Research was conducted on: {question}",
            f"",
            f"## Key Findings",
            f""
        ]
        
        for i, fact in enumerate(facts[:10], 1):
            content = fact.get("content", "")
            lines.append(f"- {content}")
        
        return Report(
            question=question,
            content="\n".join(lines),
            citations=citations,
            knowledge_gaps=["Report generation encountered an error - this is a simplified summary"]
        )
    
    async def generate_follow_up(
        self,
        original_question: str,
        follow_up: str,
        relevant_facts: list[dict[str, Any]]
    ) -> Report:
        """
        Generate a focused response to a follow-up question.
        
        Args:
            original_question: The original research question
            follow_up: The follow-up question
            relevant_facts: Facts relevant to the follow-up
            
        Returns:
            A focused Report
        """
        facts_text = self._format_facts(relevant_facts, [])
        
        prompt = FOLLOW_UP_PROMPT.format(
            original_question=original_question,
            follow_up=follow_up,
            relevant_facts=facts_text
        )
        
        try:
            content = await self.llm.generate(
                system="You respond to follow-up research questions concisely and accurately.",
                user=prompt
            )
            
            return Report(
                question=follow_up,
                content=content,
                citations=[]
            )
            
        except Exception as e:
            logger.error(f"Follow-up response failed: {e}")
            return Report(
                question=follow_up,
                content=f"Unable to generate response: {e}"
            )
    
    def _format_facts(self, facts: list[dict[str, Any]], citations: list[Citation]) -> str:
        """Format facts for the synthesis prompt."""
        if not facts:
            return "(No facts extracted - synthesize from source summaries)"
        
        # Create URL to citation number mapping
        url_to_num = {c.url: c.citation_number for c in citations if c.citation_number}
        
        lines = []
        for i, fact in enumerate(facts, 1):
            content = fact.get("content", "")
            source = fact.get("source_url", "Unknown")
            fact_type = fact.get("type", "fact")
            confidence = fact.get("confidence", "medium")
            
            # Add citation number if available
            cite_num = url_to_num.get(source, "?")
            
            lines.append(f"{i}. [{fact_type}, {confidence}] {content} [Source {cite_num}]")
        
        return "\n".join(lines)
    
    def _format_sources(self, citations: list[Citation]) -> str:
        """Format citations for the synthesis prompt."""
        if not citations:
            return "(No sources available)"
        
        lines = []
        for citation in citations:
            num = citation.citation_number or "?"
            title = citation.title or "Untitled"
            snippet = citation.snippet[:200] if citation.snippet else ""
            
            lines.append(f"[{num}] {title}")
            lines.append(f"    URL: {citation.url}")
            if snippet:
                lines.append(f"    Summary: {snippet}...")
            lines.append("")
        
        return "\n".join(lines)
    
    def _extract_knowledge_gaps(self, content: str) -> list[str]:
        """Extract knowledge gaps mentioned in the report."""
        gaps = []
        
        # Look for a Knowledge Gaps section
        lower_content = content.lower()
        if "knowledge gap" in lower_content or "further research" in lower_content or "limitations" in lower_content:
            lines = content.split("\n")
            in_gaps_section = False
            
            for line in lines:
                line_lower = line.lower()
                if any(term in line_lower for term in ["knowledge gap", "limitation", "further research", "areas for"]):
                    in_gaps_section = True
                    continue
                elif line.startswith("##") and in_gaps_section:
                    break
                elif in_gaps_section and line.strip().startswith("-"):
                    gap = line.strip()[1:].strip()
                    if gap:
                        gaps.append(gap)
        
        return gaps
