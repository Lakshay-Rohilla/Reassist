# ReAssist - AI Research Assistant Frontend

A production-ready Next.js application for an AI-powered research assistant that helps business analysts, researchers, and product managers conduct autonomous market and competitor research.

![Research Interface](docs/screenshot.png)

## ✨ Features

- **Multi-Source Research Simulation**: Simulates AI agent research with realistic progress updates
- **Comprehensive Reports**: Detailed research reports with executive summaries, sectioned findings, and citations
- **Interactive Citations**: Hover over citations to see source details with tooltips
- **Follow-Up Questions**: Continue exploring topics with contextual follow-up questions
- **Beautiful UI**: Modern, polished interface with smooth animations and transitions
- **Responsive Design**: Works great on desktop and tablet screens

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with fonts and metadata
│   ├── page.tsx           # Main research interface
│   └── globals.css        # Global styles and Tailwind utilities
├── components/            # React components
│   ├── ResearchInput.tsx  # Welcome screen with question input
│   ├── ProgressIndicator.tsx  # Animated research progress
│   ├── ResearchReport.tsx # Complete report display
│   ├── Citation.tsx       # Inline citations with tooltips
│   ├── SourcesList.tsx    # References section
│   ├── FollowUpInput.tsx  # Follow-up question input
│   └── index.ts           # Component exports
├── hooks/                 # Custom React hooks
│   └── use-research.ts    # Research state management
├── lib/                   # Utilities and data
│   ├── types.ts           # TypeScript interfaces
│   └── mock-research.ts   # Sample data and simulation logic
└── public/                # Static assets
```

## 🎨 Design System

### Colors

- **Primary**: Indigo (`#6366f1`) - Interactive elements, CTAs
- **Accent**: Teal (`#14b8a6`) - Highlights, success states
- **Neutrals**: Slate gray scale for text and borders

### Typography

- **Font**: Inter (Google Fonts)
- Clean, modern sans-serif optimized for UI

### Components

- **Glass Card**: Semi-transparent cards with blur backdrop
- **Buttons**: Primary (gradient) and secondary (subtle) variants
- **Inputs**: Rounded fields with subtle focus states

## 🧪 Sample Research Topics

The demo includes three pre-built research reports:

1. **Electric Vehicle Battery Technology** - Solid-state batteries, lithium-ion advances, recycling
2. **AI in Drug Discovery** - Molecular screening, AlphaFold, clinical trials
3. **Cloud Infrastructure** - AWS/Azure/GCP competition, AI workloads, multi-cloud

Click the example chips on the home screen to try each one!

## 🔧 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📝 Future Enhancements

- [ ] Backend integration with actual AI research agents
- [ ] Export reports as PDF/Markdown
- [ ] Save and share research sessions
- [ ] User authentication and history
- [ ] Dark mode support

## 📄 License

This project is part of the Automated Research Assistant internship project.

---

Built with ❤️ for enterprise research intelligence
