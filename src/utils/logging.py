"""
Logging Configuration

Provides structured logging with rich formatting for the CLI.
"""

import logging
import sys
from typing import Any

from rich.logging import RichHandler


def setup_logging(level: str = "INFO") -> None:
    """
    Configure logging for the application.
    
    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR)
    """
    # Map string to logging level
    level_map = {
        "DEBUG": logging.DEBUG,
        "INFO": logging.INFO,
        "WARNING": logging.WARNING,
        "ERROR": logging.ERROR,
    }
    log_level = level_map.get(level.upper(), logging.INFO)
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format="%(message)s",
        datefmt="[%X]",
        handlers=[
            RichHandler(
                rich_tracebacks=True,
                show_path=False,
                markup=True,
            )
        ],
    )
    
    # Reduce noise from third-party libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("chromadb").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for a module.
    
    Args:
        name: Module name (typically __name__)
        
    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)


class StructuredLogger:
    """
    A structured logger that captures context for debugging.
    
    Useful for tracking agent actions with full context.
    """
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self.context: dict[str, Any] = {}
    
    def set_context(self, **kwargs: Any) -> None:
        """Set context that will be included in all log messages."""
        self.context.update(kwargs)
    
    def clear_context(self) -> None:
        """Clear all context."""
        self.context.clear()
    
    def _format_message(self, message: str) -> str:
        """Format message with context."""
        if not self.context:
            return message
        context_str = " ".join(f"{k}={v}" for k, v in self.context.items())
        return f"{message} [{context_str}]"
    
    def debug(self, message: str, **kwargs: Any) -> None:
        self.context.update(kwargs)
        self.logger.debug(self._format_message(message))
    
    def info(self, message: str, **kwargs: Any) -> None:
        self.context.update(kwargs)
        self.logger.info(self._format_message(message))
    
    def warning(self, message: str, **kwargs: Any) -> None:
        self.context.update(kwargs)
        self.logger.warning(self._format_message(message))
    
    def error(self, message: str, **kwargs: Any) -> None:
        self.context.update(kwargs)
        self.logger.error(self._format_message(message))
