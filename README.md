# Automated Research Assistant

An autonomous AI agent that conducts comprehensive market and competitor research.

## Features

- 🔍 **Autonomous Research**: Multi-step web search with intelligent query generation
- 📄 **Content Extraction**: Clean text extraction from web pages
- 🧠 **Fact Extraction**: LLM-powered analysis and fact extraction
- 📚 **Citation Management**: Automatic source tracking and citation
- 💾 **Vector Memory**: Semantic search over gathered content
- ✅ **Quality Validation**: Source diversity and coverage metrics
- 📊 **Rich Reports**: Markdown and JSON export formats

## Quick Start

```bash
# 1. Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure API keys
copy .env.example .env
# Edit .env with your API keys

# 4. Run research
python -m src.main "What are emerging trends in EV batteries?"
```

## CLI Usage

```bash
# Basic research
python -m src.main "Your research question"

# Interactive mode (follow-up questions)
python -m src.main -i "Compare Tesla and BYD"

# Save report to file
python -m src.main -o report.md "AI in healthcare"

# Export as JSON
python -m src.main -o report.json -f json "Market analysis"

# Check configuration
python -m src.main check

# Debug mode
python -m src.main -d "Your question"
```

## Configuration

Create a `.env` file with:

```env
# Required: LLM Provider (choose one)
ANTHROPIC_API_KEY=sk-ant-...
# or OPENAI_API_KEY=sk-...
# or GOOGLE_API_KEY=...

# Required: Search API
TAVILY_API_KEY=tvly-...

# Optional settings
LLM_PROVIDER=anthropic  # anthropic, openai, or google
MAX_ITERATIONS=10
MAX_COST_PER_REQUEST=2.0
```

## Project Structure

```
src/
├── main.py              # CLI entry point
├── agent/
│   ├── orchestrator.py  # Main agent loop
│   ├── planner.py       # Action planning
│   └── prompts.py       # LLM prompts
├── tools/
│   ├── search.py        # Web search (Tavily)
│   ├── fetch.py         # Content extraction
│   └── analyze.py       # Document analysis
├── memory/
│   ├── session.py       # Session state
│   └── vector_store.py  # ChromaDB integration
├── synthesis/
│   ├── citations.py     # Citation tracking
│   └── report.py        # Report generation
└── utils/
    ├── config.py        # Configuration
    ├── llm.py           # LLM client factory
    ├── quality.py       # Quality validation
    └── cost_tracker.py  # Cost monitoring
```

## Running Tests

```bash
# Run all tests
pytest tests/ -v

# With coverage
pytest tests/ -v --cov=src

# Specific test file
pytest tests/test_quality.py -v
```

## API Keys

- **Anthropic**: Get at [console.anthropic.com](https://console.anthropic.com)
- **OpenAI**: Get at [platform.openai.com](https://platform.openai.com)
- **Tavily**: Get free key at [tavily.com](https://tavily.com)

## License

MIT License
