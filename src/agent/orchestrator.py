"""
Research Orchestrator - The main agent loop that coordinates research activities.

This is the heart of the agentic system, implementing the observe-think-act loop:
1. OBSERVE: Assess current state (what we know, what we've searched)
2. THINK: Plan next action (search, fetch, analyze, or complete)
3. ACT: Execute the chosen action via tools
4. Repeat until the research goal is achieved
"""

import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from src.agent.planner import ResearchPlanner, ActionType, AgentAction, generate_initial_queries
from src.agent.prompts import SYSTEM_PROMPT, SYNTHESIS_PROMPT
from src.memory.session import SessionMemory
from src.memory.vector_store import VectorStore
from src.synthesis.citations import CitationManager, Citation
from src.synthesis.report import ReportGenerator, Report
from src.tools.search import WebSearchTool
from src.tools.fetch import ContentFetchTool
from src.tools.analyze import DocumentAnalyzer
from src.utils.config import Settings
from src.utils.logging import get_logger
from src.utils.cost_tracker import CostTracker
from src.utils.llm import get_llm_client
from src.utils.quality import validate_research_quality

logger = get_logger(__name__)


@dataclass
class ResearchState:
    """Current state of the research session."""
    question: str
    searches_performed: list[str] = field(default_factory=list)
    urls_fetched: list[str] = field(default_factory=list)
    pending_urls: list[str] = field(default_factory=list)  # URLs to fetch
    facts_extracted: list[dict[str, Any]] = field(default_factory=list)
    iteration: int = 0
    started_at: datetime = field(default_factory=datetime.now)


class ResearchOrchestrator:
    """
    Main orchestrator that coordinates the research process.
    
    This class implements the core agent loop:
    - Receives a research question
    - Plans and executes research actions iteratively
    - Manages memory and context
    - Synthesizes findings into a report
    """
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.llm = get_llm_client(settings)
        self.cost_tracker = CostTracker()
        
        # Initialize tools
        self.search_tool = WebSearchTool(settings)
        self.fetch_tool = ContentFetchTool()
        self.analyzer = DocumentAnalyzer(self.llm)
        
        # Initialize memory systems
        self.session_memory = SessionMemory()
        self.vector_store = VectorStore()
        
        # Initialize synthesis components
        self.citation_manager = CitationManager()
        self.report_generator = ReportGenerator(self.llm)
        
        # Planner
        self.planner = ResearchPlanner(self.llm)
        
        # State
        self.state: ResearchState | None = None
    
    async def research(self, question: str) -> Report:
        """
        Main entry point for conducting research.
        
        Args:
            question: The research question to investigate
            
        Returns:
            A structured research report with citations
        """
        logger.info(f"Starting research: {question}")
        
        # Initialize state
        self.state = ResearchState(question=question)
        self.session_memory.start_session(question)
        
        # Phase 1: Initial multi-query search
        await self._initial_search_phase(question)
        
        # Phase 2: Fetch and analyze top results
        await self._fetch_phase()
        
        # Phase 3: Iterative refinement
        while self.state.iteration < self.settings.max_iterations:
            self.state.iteration += 1
            logger.info(f"Iteration {self.state.iteration}/{self.settings.max_iterations}")
            
            # Check cost limits
            if self.cost_tracker.total_cost >= self.settings.max_cost_per_request:
                logger.warning("Cost limit reached, stopping research")
                break
            
            # OBSERVE: Gather current context
            context = self._build_context()
            
            # THINK: Plan next action
            action = await self.planner.plan_next_action(context)
            logger.info(f"Planned action: {action.type.value} - {action.reasoning}")
            
            # Check if complete
            if action.type == ActionType.COMPLETE:
                logger.info("Research complete signal received")
                break
            
            # ACT: Execute the action
            await self._execute_action(action)
        
        # Synthesize report
        report = await self._synthesize_report()
        
        # Add cost tracking
        report.total_cost = self.cost_tracker.total_cost
        
        # Run quality validation
        quality_report = validate_research_quality(
            self.state.facts_extracted,
            self.citation_manager,
            report.content
        )
        report.quality_score = quality_report.overall_score
        report.quality_level = quality_report.overall_level.value
        
        logger.info(f"Research complete. Sources: {len(report.citations)}, Quality: {quality_report.overall_level.value}, Cost: ${report.total_cost:.4f}")
        
        return report
    
    async def _initial_search_phase(self, question: str) -> None:
        """Execute initial broad search with multiple queries."""
        logger.info("Phase 1: Initial search phase")
        
        # Generate diverse initial queries
        queries = await generate_initial_queries(self.llm, question, count=3)
        
        # Execute searches
        for query in queries:
            await self._execute_search({"query": query})
            
            # Small delay to be nice to APIs
            await asyncio.sleep(0.5)
    
    async def _fetch_phase(self) -> None:
        """Fetch content from top-ranked URLs."""
        logger.info("Phase 2: Fetching top results")
        
        # Get top URLs to fetch (limit to avoid too many requests)
        urls_to_fetch = self.state.pending_urls[:5]
        
        for url in urls_to_fetch:
            await self._execute_fetch({"url": url})
            await asyncio.sleep(0.3)
    
    async def follow_up(self, question: str) -> Report:
        """
        Handle a follow-up question in the same session.
        
        Args:
            question: The follow-up question
            
        Returns:
            Response to the follow-up, using existing context
        """
        if self.state is None:
            # No existing session, start new research
            return await self.research(question)
        
        logger.info(f"Follow-up question: {question}")
        
        # Add follow-up to session
        self.session_memory.add_follow_up(question)
        
        # Search for relevant existing content
        relevant_content = self.vector_store.search(question, top_k=5)
        
        # Determine if new searches needed
        context = self._build_context()
        context["follow_up"] = question
        context["relevant_existing"] = relevant_content
        
        action = await self.planner.plan_next_action(context)
        
        if action.type != ActionType.COMPLETE:
            await self._execute_action(action)
        
        # Generate focused response
        return await self._synthesize_follow_up_response(question)
    
    def _build_context(self) -> dict[str, Any]:
        """Build the current context for the planner."""
        return {
            "original_question": self.state.question,
            "searches_performed": self.state.searches_performed,
            "urls_fetched": self.state.urls_fetched,
            "pending_urls": self.state.pending_urls,
            "facts_count": len(self.state.facts_extracted),
            "facts_summary": self._summarize_facts(),
            "iteration": self.state.iteration,
            "max_iterations": self.settings.max_iterations,
            "sources_count": len(self.citation_manager.citations),
        }
    
    def _summarize_facts(self) -> str:
        """Create a summary of extracted facts for context."""
        if not self.state.facts_extracted:
            return "No facts extracted yet."
        
        # Group by topic/theme - show diverse sample
        summary_parts = []
        for fact in self.state.facts_extracted[-10:]:  # Last 10 facts
            content = fact.get('content', '')[:150]
            summary_parts.append(f"- {content}...")
        
        return "\n".join(summary_parts)
    
    async def _execute_action(self, action: AgentAction) -> None:
        """Execute a planned action."""
        try:
            if action.type == ActionType.SEARCH:
                await self._execute_search(action.parameters)
            elif action.type == ActionType.FETCH:
                await self._execute_fetch(action.parameters)
            elif action.type == ActionType.ANALYZE:
                await self._execute_analyze(action.parameters)
        except Exception as e:
            logger.error(f"Action execution failed: {e}")
            # Don't halt - agent will adapt in next iteration
    
    async def _execute_search(self, params: dict[str, Any]) -> None:
        """Execute a web search."""
        query = params.get("query", self.state.question)
        
        # Skip if already searched
        if query.lower() in [q.lower() for q in self.state.searches_performed]:
            logger.info(f"Skipping duplicate search: {query}")
            return
        
        logger.info(f"Searching: {query}")
        
        # Track cost
        self.cost_tracker.record_search_usage("tavily", 1)
        
        results = await self.search_tool.execute(query=query)
        
        if results.success:
            self.state.searches_performed.append(query)
            self.session_memory.add_search(query, results.data)
            
            # Store search results and queue URLs for fetching
            for result in results.data.get("results", []):
                url = result.get("url", "")
                title = result.get("title", "")
                snippet = result.get("snippet", "")
                
                if url and url not in self.state.urls_fetched and url not in self.state.pending_urls:
                    self.state.pending_urls.append(url)
                    self.citation_manager.add_potential_source(
                        url=url,
                        title=title,
                        snippet=snippet
                    )
    
    async def _execute_fetch(self, params: dict[str, Any]) -> None:
        """Fetch and process webpage content."""
        url = params.get("url")
        
        if not url:
            return
            
        # Skip if already fetched
        if url in self.state.urls_fetched:
            return
        
        # Remove from pending if present
        if url in self.state.pending_urls:
            self.state.pending_urls.remove(url)
        
        logger.info(f"Fetching: {url}")
        result = await self.fetch_tool.execute(url=url)
        
        if result.success:
            self.state.urls_fetched.append(url)
            content = result.data.get("content", "")
            title = result.data.get("title", "")
            
            if content:
                # Store in vector database for semantic search
                self.vector_store.add_document(
                    content=content,
                    metadata={"url": url, "title": title}
                )
                
                # Update citation with full content
                self.citation_manager.update_source_content(url, content)
                
                # Mark as used since we fetched it
                self.citation_manager.mark_used(url)
                
                # Extract facts from content
                await self._execute_analyze({"content": content, "url": url})
    
    async def _execute_analyze(self, params: dict[str, Any]) -> None:
        """Analyze document content to extract facts."""
        content = params.get("content", "")
        url = params.get("url", "")
        
        if not content:
            return
        
        logger.info(f"Analyzing content from: {url[:50]}...")
        result = await self.analyzer.execute(
            content=content,
            question=self.state.question
        )
        
        if result.success:
            facts = result.data.get("facts", [])
            for fact in facts:
                fact["source_url"] = url
                self.state.facts_extracted.append(fact)
                self.session_memory.add_fact(fact)
            
            logger.info(f"Extracted {len(facts)} facts from {url[:30]}...")
    
    async def _synthesize_report(self) -> Report:
        """Synthesize all findings into a structured report."""
        logger.info("Synthesizing research report...")
        
        # Gather all content and facts
        all_facts = self.state.facts_extracted
        citations = self.citation_manager.get_used_citations()
        
        # If no citations marked as used, mark fetched URLs
        if not citations:
            for url in self.state.urls_fetched:
                self.citation_manager.mark_used(url)
            citations = self.citation_manager.get_used_citations()
        
        # Generate report
        report = await self.report_generator.generate(
            question=self.state.question,
            facts=all_facts,
            citations=citations
        )
        
        return report
    
    async def _synthesize_follow_up_response(self, question: str) -> Report:
        """Generate a focused response to a follow-up question."""
        # Get relevant facts for follow-up
        relevant_facts = [
            f for f in self.state.facts_extracted
            if self._is_relevant(f, question)
        ]
        
        return await self.report_generator.generate_follow_up(
            original_question=self.state.question,
            follow_up=question,
            relevant_facts=relevant_facts
        )
    
    def _is_relevant(self, fact: dict, question: str) -> bool:
        """Check if a fact is relevant to a question (simple heuristic)."""
        question_words = set(question.lower().split())
        fact_words = set(fact.get("content", "").lower().split())
        # Remove common words
        stopwords = {"the", "a", "an", "is", "are", "was", "were", "what", "how", "why", "when", "where"}
        question_words -= stopwords
        overlap = question_words & fact_words
        return len(overlap) >= 2
