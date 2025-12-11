"""
Research Planner - Decides what action the agent should take next.

The planner analyzes the current research state and determines the optimal
next step: search for more information, fetch specific URLs, analyze content,
or conclude that research is complete.
"""

import json
from enum import Enum
from dataclasses import dataclass, field
from typing import Any

from src.agent.prompts import PLANNER_PROMPT, QUERY_GENERATION_PROMPT
from src.utils.logging import get_logger

logger = get_logger(__name__)


class ActionType(Enum):
    """Types of actions the agent can take."""
    SEARCH = "search"
    FETCH = "fetch"
    ANALYZE = "analyze"
    COMPLETE = "complete"


@dataclass
class AgentAction:
    """Represents a planned action."""
    type: ActionType
    parameters: dict[str, Any] = field(default_factory=dict)
    reasoning: str = ""


class ResearchPlanner:
    """
    Plans the next action for the research agent.
    
    The planner uses the LLM to analyze the current research context and
    decide what action would be most valuable to take next.
    """
    
    def __init__(self, llm):
        self.llm = llm
    
    async def plan_next_action(self, context: dict[str, Any]) -> AgentAction:
        """
        Determine the next action based on current research state.
        
        Args:
            context: Dictionary containing:
                - original_question: The research question
                - searches_performed: List of queries already searched
                - urls_fetched: List of URLs already fetched
                - facts_count: Number of facts extracted
                - facts_summary: Summary of key facts
                - iteration: Current iteration number
                - max_iterations: Maximum allowed iterations
                - sources_count: Number of sources collected
                - pending_urls: URLs found but not yet fetched
        
        Returns:
            AgentAction with type and parameters
        """
        # Check stopping conditions first
        if self._should_complete(context):
            return AgentAction(
                type=ActionType.COMPLETE,
                reasoning="Sufficient sources and facts gathered"
            )
        
        # Check if we have pending URLs to fetch
        pending_urls = context.get("pending_urls", [])
        if pending_urls and len(context.get("urls_fetched", [])) < 5:
            # Prioritize fetching top URLs first
            url_to_fetch = pending_urls[0]
            return AgentAction(
                type=ActionType.FETCH,
                parameters={"url": url_to_fetch},
                reasoning=f"Fetching high-relevance URL: {url_to_fetch}"
            )
        
        # Build the prompt
        prompt = self._build_planner_prompt(context)
        
        try:
            # Call LLM for planning decision
            response = await self.llm.generate(
                system=PLANNER_PROMPT,
                user=prompt,
                response_format="json"
            )
            
            # Parse the response
            action = self._parse_planning_response(response, context)
            return action
            
        except Exception as e:
            logger.error(f"Planning failed: {e}")
            # Default to search if planning fails
            return await self._generate_search_query(context)
    
    def _should_complete(self, context: dict[str, Any]) -> bool:
        """Check if research should be completed."""
        facts_count = context.get("facts_count", 0)
        sources_count = context.get("sources_count", 0)
        urls_fetched = len(context.get("urls_fetched", []))
        iteration = context.get("iteration", 0)
        max_iterations = context.get("max_iterations", 10)
        
        # Complete if we have enough sources and facts
        if urls_fetched >= 5 and facts_count >= 10:
            return True
        
        # Complete if we're near max iterations
        if iteration >= max_iterations - 1:
            return True
        
        # Complete if we have good coverage
        if sources_count >= 8 and facts_count >= 15:
            return True
        
        return False
    
    def _build_planner_prompt(self, context: dict[str, Any]) -> str:
        """Build the prompt for the planner."""
        searches = context.get('searches_performed', [])
        pending = context.get('pending_urls', [])[:5]  # Show top 5
        
        return f"""
Current Research State:
=======================
Original Question: {context.get('original_question', 'Unknown')}

Progress:
- Iteration: {context.get('iteration', 0)} of {context.get('max_iterations', 10)}
- Searches performed: {len(searches)}
- URLs fetched: {len(context.get('urls_fetched', []))}
- Facts extracted: {context.get('facts_count', 0)}
- Sources collected: {context.get('sources_count', 0)}

Previous Searches:
{self._format_list(searches)}

Pending URLs to fetch:
{self._format_list(pending)}

Summary of Findings:
{context.get('facts_summary', 'No facts yet.')}

Follow-up Context (if any):
{context.get('follow_up', 'None')}

Based on this state, what should the agent do next?
Respond with a JSON object containing:
- action: one of "search", "fetch", "analyze", or "complete"
- parameters: action-specific parameters (query for search, url for fetch)
- reasoning: brief explanation of why this action was chosen

Consider:
1. Have we gathered enough diverse sources? (aim for 5-15)
2. Are there gaps in our understanding?
3. Have we explored multiple perspectives?
4. Is more depth needed on any subtopic?
"""
    
    def _format_list(self, items: list) -> str:
        """Format a list for display in prompt."""
        if not items:
            return "  (none)"
        return "\n".join(f"  - {item}" for item in items[:10])
    
    def _parse_planning_response(self, response: str, context: dict) -> AgentAction:
        """Parse the LLM response into an AgentAction."""
        try:
            # Try to parse as JSON
            data = json.loads(response)
            
            action_str = data.get("action", "search").lower()
            parameters = data.get("parameters", {})
            reasoning = data.get("reasoning", "")
            
            # Map string to ActionType
            action_map = {
                "search": ActionType.SEARCH,
                "fetch": ActionType.FETCH,
                "analyze": ActionType.ANALYZE,
                "complete": ActionType.COMPLETE,
            }
            
            action_type = action_map.get(action_str, ActionType.SEARCH)
            
            return AgentAction(
                type=action_type,
                parameters=parameters,
                reasoning=reasoning
            )
            
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse planning response: {response[:200]}")
            # Try to extract action from text
            if "complete" in response.lower():
                return AgentAction(type=ActionType.COMPLETE, reasoning="Parsed from text")
            return AgentAction(
                type=ActionType.SEARCH,
                parameters={"query": context.get("original_question", "")},
                reasoning="Failed to parse, defaulting to search"
            )
    
    async def _generate_search_query(self, context: dict[str, Any]) -> AgentAction:
        """Generate a new search query based on current context."""
        question = context.get("original_question", "")
        previous = context.get("searches_performed", [])
        
        # If no searches yet, use the original question
        if not previous:
            return AgentAction(
                type=ActionType.SEARCH,
                parameters={"query": question},
                reasoning="Initial search with original question"
            )
        
        # Generate a new query using LLM
        try:
            prompt = QUERY_GENERATION_PROMPT.format(
                question=question,
                previous_searches="\n".join(f"- {q}" for q in previous)
            )
            
            response = await self.llm.generate(
                system="Generate search queries to explore this topic more deeply.",
                user=prompt,
                response_format="json"
            )
            
            data = json.loads(response)
            queries = data.get("queries", [])
            
            if queries:
                new_query = queries[0].get("query", question)
                return AgentAction(
                    type=ActionType.SEARCH,
                    parameters={"query": new_query},
                    reasoning=queries[0].get("purpose", "Exploring new angle")
                )
        except Exception as e:
            logger.warning(f"Query generation failed: {e}")
        
        # Fallback: modify the original question
        modifiers = ["latest", "trends", "analysis", "comparison", "future"]
        for mod in modifiers:
            modified = f"{mod} {question}"
            if modified not in previous:
                return AgentAction(
                    type=ActionType.SEARCH,
                    parameters={"query": modified},
                    reasoning=f"Exploring {mod} angle"
                )
        
        # If all else fails, complete
        return AgentAction(
            type=ActionType.COMPLETE,
            reasoning="Exhausted search variations"
        )


async def generate_initial_queries(llm, question: str, count: int = 3) -> list[str]:
    """
    Generate multiple initial search queries for a research question.
    
    Args:
        llm: LLM client
        question: The research question
        count: Number of queries to generate
        
    Returns:
        List of search queries
    """
    try:
        prompt = f"""Generate {count} diverse search queries to research this question:
        
Question: {question}

Create queries that:
1. Cover different aspects of the topic
2. Use varied terminology
3. Target different source types

Respond with JSON:
{{"queries": ["query1", "query2", "query3"]}}
"""
        response = await llm.generate(
            system="Generate search queries for comprehensive research.",
            user=prompt,
            response_format="json"
        )
        
        data = json.loads(response)
        return data.get("queries", [question])[:count]
        
    except Exception:
        # Fallback to the original question
        return [question]
