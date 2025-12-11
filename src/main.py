"""
Main entry point for the Automated Research Assistant.

Usage:
    python -m src.main "Your research question here"
    python -m src.main --interactive "Start interactive research session"
    python -m src.main --output report.md "Save report to file"
"""

import asyncio
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
from rich.table import Table
from rich.markdown import Markdown

from src.agent.orchestrator import ResearchOrchestrator
from src.utils.config import get_settings
from src.utils.logging import setup_logging, get_logger

app = typer.Typer(help="Automated Research Assistant - AI-powered research agent")
console = Console()
logger = get_logger(__name__)


def print_banner() -> None:
    """Display the application banner."""
    banner = """
╔═══════════════════════════════════════════════════════════╗
║           🔍 Automated Research Assistant 🔍              ║
║                                                           ║
║     Autonomous AI-powered market & competitor research    ║
╚═══════════════════════════════════════════════════════════╝
    """
    console.print(banner, style="bold blue")


def display_quality_badge(quality_level: str, quality_score: float) -> str:
    """Generate a quality badge based on quality level."""
    badges = {
        "excellent": "🟢 Excellent",
        "good": "🟢 Good", 
        "acceptable": "🟡 Acceptable",
        "needs_improvement": "🟠 Needs Improvement",
        "poor": "🔴 Poor"
    }
    badge = badges.get(quality_level, "⚪ Unknown")
    return f"{badge} ({quality_score:.0%})"


def display_report(report, show_quality: bool = True) -> None:
    """Display the research report with formatting."""
    console.print("\n")
    
    # Quality badge header
    if show_quality and report.quality_level:
        quality_badge = display_quality_badge(report.quality_level, report.quality_score)
        console.print(f"[bold]Quality:[/bold] {quality_badge}\n")
    
    # Main content
    console.print(Panel(
        Markdown(report.content), 
        title="📋 Research Report", 
        border_style="green",
        padding=(1, 2)
    ))
    
    # Citations table
    if report.citations:
        console.print("\n[bold]📚 Sources:[/bold]")
        table = Table(show_header=True, header_style="bold cyan")
        table.add_column("#", style="dim", width=3)
        table.add_column("Title", width=40)
        table.add_column("URL", style="blue")
        
        for citation in report.citations:
            table.add_row(
                str(citation.citation_number or "?"),
                citation.title[:40] + "..." if len(citation.title) > 40 else citation.title,
                citation.url[:50] + "..." if len(citation.url) > 50 else citation.url
            )
        
        console.print(table)
    
    # Knowledge gaps
    if report.knowledge_gaps:
        console.print("\n[bold yellow]⚠️ Knowledge Gaps:[/bold yellow]")
        for gap in report.knowledge_gaps:
            console.print(f"  • {gap}")
    
    # Metadata footer
    console.print(f"\n[dim]💰 Cost: ${report.total_cost:.4f}[/dim]")


def save_report(report, filepath: str, format: str = "markdown") -> None:
    """Save report to file."""
    path = Path(filepath)
    
    if format == "json":
        data = {
            "question": report.question,
            "content": report.content,
            "citations": [
                {"number": c.citation_number, "title": c.title, "url": c.url}
                for c in report.citations
            ],
            "knowledge_gaps": report.knowledge_gaps,
            "quality_score": report.quality_score,
            "quality_level": report.quality_level,
            "total_cost": report.total_cost,
            "generated_at": datetime.now().isoformat()
        }
        path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    else:
        # Markdown format
        path.write_text(report.to_markdown(), encoding="utf-8")
    
    console.print(f"\n[green]✅ Report saved to:[/green] {path.absolute()}")


async def run_research(
    question: str, 
    interactive: bool = False,
    output_file: Optional[str] = None,
    output_format: str = "markdown"
) -> None:
    """Execute the research pipeline."""
    settings = get_settings()
    
    # Validate configuration
    config_errors = settings.validate_config()
    if config_errors:
        console.print("[bold red]Configuration Error:[/bold red]")
        for error in config_errors:
            console.print(f"  • {error}")
        console.print("\n[dim]Please configure your API keys in .env file[/dim]")
        raise typer.Exit(code=1)
    
    console.print(f"\n[bold green]📝 Research Question:[/bold green]")
    console.print(f"   {question}\n")
    
    # Initialize orchestrator
    orchestrator = ResearchOrchestrator(settings)
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(bar_width=20),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        console=console,
    ) as progress:
        task = progress.add_task("Initializing...", total=100)
        
        try:
            progress.update(task, advance=10, description="🔍 Searching...")
            
            # Run research (the orchestrator has its own phases)
            report = await orchestrator.research(question)
            
            progress.update(task, advance=90, description="✅ Complete!")
            
        except Exception as e:
            logger.exception("Research failed")
            console.print(f"\n[bold red]❌ Error:[/bold red] {e}")
            raise typer.Exit(code=1)
    
    # Display report
    display_report(report)
    
    # Save if requested
    if output_file:
        save_report(report, output_file, output_format)
    
    # Interactive follow-up
    if interactive:
        await interactive_session(orchestrator)


async def interactive_session(orchestrator: ResearchOrchestrator) -> None:
    """Handle follow-up questions in interactive mode."""
    console.print("\n" + "─" * 50)
    console.print("[bold cyan]💬 Interactive Mode[/bold cyan]")
    console.print("Ask follow-up questions or type 'exit' to quit.\n")
    
    while True:
        try:
            question = console.input("[bold cyan]You:[/bold cyan] ")
            
            if question.lower() in ("exit", "quit", "q", "bye"):
                console.print("\n[dim]👋 Goodbye! Happy researching![/dim]")
                break
            
            if not question.strip():
                continue
            
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=console,
            ) as progress:
                task = progress.add_task("Processing...", total=None)
                response = await orchestrator.follow_up(question)
                progress.update(task, description="Done!")
            
            console.print(Panel(
                Markdown(response.content), 
                title="🤖 Response",
                border_style="blue"
            ))
            
        except KeyboardInterrupt:
            console.print("\n[dim]👋 Interrupted. Goodbye![/dim]")
            break
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")


@app.command("research")
def research_cmd(
    question: str = typer.Argument(..., help="The research question to investigate"),
    interactive: bool = typer.Option(False, "--interactive", "-i", help="Enable follow-up questions"),
    debug: bool = typer.Option(False, "--debug", "-d", help="Enable debug logging"),
    output: Optional[str] = typer.Option(None, "--output", "-o", help="Save report to file"),
    format: str = typer.Option("markdown", "--format", "-f", help="Output format: markdown or json"),
) -> None:
    """
    Conduct autonomous research on a given question.
    
    Examples:
        python -m src.main research "What are emerging trends in EV batteries?"
        python -m src.main research -i "Compare Tesla and BYD"
        python -m src.main research -o report.md "AI in healthcare"
    """
    # Setup logging
    log_level = "DEBUG" if debug else "INFO"
    setup_logging(log_level)
    
    # Display banner
    print_banner()
    
    # Validate format
    if format not in ("markdown", "json"):
        console.print("[red]Error: Format must be 'markdown' or 'json'[/red]")
        raise typer.Exit(code=1)
    
    # Run async research
    try:
        asyncio.run(run_research(question, interactive, output, format))
    except KeyboardInterrupt:
        console.print("\n[yellow]⚠️ Research cancelled by user.[/yellow]")
        raise typer.Exit(code=130)



@app.command("version")
def version():
    """Show version information."""
    from src import __version__
    console.print(f"Automated Research Assistant v{__version__}")


@app.command("check")
def check_config():
    """Check configuration and API key status."""
    settings = get_settings()
    
    console.print("[bold]Configuration Check[/bold]\n")
    
    # Check LLM
    llm_key = settings.get_active_llm_key()
    if llm_key:
        console.print(f"✅ LLM Provider: {settings.llm_provider}")
    else:
        console.print(f"❌ LLM Provider: {settings.llm_provider} - [red]API key missing[/red]")
    
    # Check Search
    if settings.tavily_api_key:
        console.print("✅ Search: Tavily API configured")
    else:
        console.print("❌ Search: Tavily API - [red]API key missing[/red]")
    
    # Settings summary
    console.print(f"\n[dim]Max iterations: {settings.max_iterations}[/dim]")
    console.print(f"[dim]Max cost: ${settings.max_cost_per_request}[/dim]")


if __name__ == "__main__":
    app()
