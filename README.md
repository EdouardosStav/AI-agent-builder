# AI Agent Builder

A powerful visual pipeline builder for creating multi-step AI workflows. Design, test, and deploy custom AI pipelines with an intuitive drag-and-drop interface.

![AI Agent Builder](https://img.shields.io/badge/AI-Pipeline_Builder-blue)
![React](https://img.shields.io/badge/React-18.3.1-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Overview

AI Agent Builder allows users to create sophisticated AI pipelines without coding. Chain together multiple AI operations like summarization, translation, rewriting, and extraction to process text through multiple transformation steps.

### Key Features

- **Visual Pipeline Builder**: Intuitive drag-and-drop interface for creating workflows
- **Multiple AI Operations**:
  - **Summarize**: Create concise summaries (short/medium/long, bullet points/paragraph)
  - **Translate**: Support for 8+ languages (French, Spanish, German, Italian, Portuguese, Dutch, Chinese, Japanese)
  - **Rewrite**: Transform tone (casual, formal, professional, friendly)
  - **Extract**: Pull out keywords, entities, or both
- **AI Assistant**: Natural language to pipeline generation - just describe what you want
- **Workflow Management**: Save, load, and manage multiple pipelines
- **Real-time Execution**: See step-by-step results with streaming output
- **User Authentication**: Secure login and personal workspace
- **Modern UI**: Beautiful, responsive design with Tailwind CSS and shadcn/ui

## Tech Stack

### Frontend
- **React 18.3.1** with TypeScript
- **Vite** - Lightning fast build tool
- **Tailwind CSS** + **shadcn/ui** - Modern, accessible UI components
- **@dnd-kit** - Drag and drop functionality
- **TanStack Query** - Server state management
- **React Router v7** - Client-side routing
- **Framer Motion** - Smooth animations

### Backend & Infrastructure
- **Supabase**:
  - PostgreSQL database
  - Authentication
  - Edge Functions (Deno)
- **Prisma ORM** - Type-safe database access
- **Vercel AI SDK** - AI model integration
- **OpenAI GPT-4** - AI processing

### Development
- **TypeScript** - Type safety
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account
- OpenAI API key
- Git

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/EdouardosStav/AI-agent-builder.git
cd AI-agent-builder
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Database URLs (from Supabase dashboard)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres"

# OpenAI API Key
OPENAI_API_KEY=sk-...your-openai-key
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed initial data
npx prisma db seed
```

### 5. Supabase Edge Functions Setup

```bash
# Login to Supabase CLI
npx supabase login

# Link your project
npx supabase link --project-ref your-project-ref

# Deploy edge functions
npx supabase functions deploy execute-pipeline-step
npx supabase functions deploy generate-pipeline

# Set secrets
npx supabase secrets set OPENAI_API_KEY=your-openai-key
```

### 6. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:5173` to see the application.

## Usage Guide

### Creating a Pipeline

1. **Start Building**: Click "New Pipeline" or use the AI Assistant
2. **Add Steps**: Drag AI operation blocks from the sidebar
3. **Configure**: Click on each step to set parameters
4. **Connect**: Steps automatically connect in sequence
5. **Test**: Enter sample text and click "Execute Pipeline"
6. **Save**: Name your workflow and save for later use

### Using the AI Assistant

1. Navigate to the AI Assistant page
2. Describe your goal in natural language:
   - "Make this content professional and translate to Spanish"
   - "Summarize this text and extract key points"
3. The AI will generate an appropriate pipeline
4. Click "Use This Pipeline" to load it in the builder

### Managing Workflows

- **My Workflows**: View all saved pipelines
- **Edit**: Click on any workflow to modify
- **Delete**: Remove unwanted workflows
- **Share**: (Coming soon) Share workflows with others

## Project Structure

```
ai-agent-builder/
├── src/
│   ├── components/     # React components
│   │   ├── pipeline/   # Pipeline builder components
│   │   ├── ui/        # shadcn/ui components
│   │   └── layout/    # Layout components
│   ├── contexts/      # React contexts (Auth, etc)
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── types/         # TypeScript types
│   ├── lib/           # Utilities
│   └── integrations/  # External service integrations
├── prisma/
│   └── schema.prisma  # Database schema
├── supabase/
│   └── functions/     # Edge functions
├── public/            # Static assets
└── [config files]     # Various configuration files
```

### Manual Deployment

```bash
# Build for production
npm run build

# Serve dist folder with any static host
```

## Configuration

### Supabase Configuration

1. Enable Email authentication in Supabase dashboard
2. Configure OAuth providers if needed
3. Set up Row Level Security (RLS) policies
4. Configure CORS for edge functions

### Database Schema

The project uses Prisma with the following main models:
- **User**: Authentication and profile
- **Workflow**: Saved pipeline configurations
- **WorkflowStep**: Individual steps in pipelines (JSON)

## What's Implemented

- [x] Drag-and-drop pipeline builder
- [x] All 4 AI operation types (summarize, translate, rewrite, extract)
- [x] Step configuration UI
- [x] Pipeline execution with OpenAI
- [x] User authentication (Supabase)
- [x] Save/load workflows
- [x] AI Assistant for natural language pipeline generation
- [x] Responsive design
- [x] Real-time streaming responses
- [x] Error handling and validation
- [x] Modern UI with animations

## What's Missing / TODO

### Core Features
- [ ] **Public workflow sharing** - Schema supports it, needs UI implementation
- [ ] **Workflow templates** - Pre-built pipeline examples
- [ ] **Collaborative editing** - Real-time multi-user support
- [ ] **Version history** - Track workflow changes
- [ ] **Export/Import** - Download/upload workflow definitions

### Technical Improvements
- [ ] **Comprehensive test suite** - Unit and integration tests
- [ ] **Error boundaries** - Better error recovery
- [ ] **Performance optimization** - Code splitting, lazy loading
- [ ] **Offline support** - PWA capabilities
- [ ] **API rate limiting** - Protect against abuse
- [ ] **Webhook support** - Trigger pipelines via API

### UI/UX Enhancements
- [ ] **Dark mode** - Theme switching
- [ ] **Keyboard shortcuts** - Power user features
- [ ] **Mobile optimization** - Better touch support
- [ ] **Onboarding flow** - First-time user experience
- [ ] **Analytics dashboard** - Usage statistics

### AI Features
- [ ] **More AI models** - Claude, Gemini support
- [ ] **Custom prompts** - User-defined operations
- [ ] **Batch processing** - Process multiple inputs
- [ ] **Conditional logic** - If/then branching
- [ ] **External integrations** - Connect to other services

## Known Issues

1. **Streaming responses** may not work in some browsers
2. **Large text inputs** can hit API limits
3. **Drag preview** sometimes glitches on Firefox
4. **Mobile drag-and-drop** needs improvement

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built as part of an AI workflow challenge
- Inspired by node-based programming interfaces
- Thanks to the open-source community for the amazing tools
- Special thanks to Anthropic, OpenAI, and Supabase teams

## Contact & Support

- **Author**: Edouardos Stav
- **GitHub**: [@EdouardosStav](https://github.com/EdouardosStav)

---
