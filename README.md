# 🎵 Disco

**Your research partner that interviews, synthesizes, and cites—so your team ships the right things faster.**

Disco is a research platform for product teams running continuous discovery. Conduct voice or text interviews at scale, auto-summarize sessions, and surface themes with evidence-backed citations.

## ✨ Key Features

- **🎙️ Smart Interviews**: Conduct voice↔voice, voice↔text, or text↔text interviews powered by OpenAI Realtime API
- **📝 Auto-Summarization**: Get structured summaries (Problems/Goals/Friction/Opportunities) instantly
- **🎯 Theme Synthesis**: Automatically discover patterns across sessions with confidence scoring
- **💬 Cited Answers**: Query insights via chat and get answers with jump-to citations like `[S12@03:14]`
- **🔗 One-Click Actions**: Send summaries to Slack, create Linear issues, schedule follow-ups
- **🔒 Privacy-First**: Built-in consent management, PII redaction, and data retention policies

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Set up database and run migrations
npm run db:migrate

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

📖 **Detailed setup instructions**: [docs/SETUP.md](./docs/SETUP.md)

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 (App Router) + React 19 + Tailwind CSS
- **Database**: PostgreSQL + Prisma + pgvector
- **AI/ML**: OpenAI (GPT-4, Whisper, Embeddings, Realtime API)
- **Storage**: Supabase (Database + Object Storage)
- **Auth**: NextAuth.js
- **Jobs**: Inngest
- **Hosting**: Vercel

## 📊 Core Concepts

### Interview Series

Create a research focus, define goals, and generate adaptive interview questions. Share a unique invite link with participants.

### Sessions

Each interview is captured with real-time transcription, PII redaction, and audio backup. Switch between voice and text modes at any time.

### Themes

Cross-session patterns are automatically synthesized with confidence scores based on evidence volume, diversity, recency, and consistency.

### RAG-Powered Chat

Query your research at any scope (global/series/session/theme) and get cited answers that link directly to the source.

## 🗂️ Project Structure

```
disco-agent/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities (Prisma, Supabase, etc.)
│   └── generated/        # Prisma client
├── prisma/
│   └── schema.prisma     # Database schema
├── scripts/              # Database and setup scripts
├── docs/                 # Documentation
└── .cursor/
    └── scratchpad.md     # Development plan and progress
```

## 🧪 Testing the Setup

**New to the project? Start here:**

1. **Quick Setup**: See [QUICK-START.md](./QUICK-START.md)
2. **Verify Setup**: Run `./scripts/verify-setup.sh`
3. **Detailed Testing**: See [docs/TESTING-GUIDE.md](./docs/TESTING-GUIDE.md)

**Quick test:**

```bash
# Check what's configured
./scripts/test-setup.sh

# Set up database and auth (see QUICK-START.md)
# Then verify everything works
./scripts/verify-setup.sh

# Start development
npm run dev
```

## 🛠️ Development

```bash
# Database commands
npm run db:migrate        # Run migrations
npm run db:studio         # Open Prisma Studio
npm run db:seed           # Seed sample data
npm run db:reset          # Reset database

# Development
npm run dev               # Start dev server
npm run build             # Build for production
npm run lint              # Run linter
```

## 📝 Development Plan

See [.cursor/scratchpad.md](./.cursor/scratchpad.md) for the complete development roadmap.

**Current Status**: Phase 2 - Series Creation ✅ COMPLETE

**Completed Phases**:

- ✅ Phase 1: Foundation & Infrastructure - [Summary](./docs/PHASE1-SUMMARY.md)
- ✅ Phase 2: Series Creation Wizard - [Summary](./docs/PHASE2-SUMMARY.md)

**Next**: Phase 3 - Interview Capture (OpenAI Realtime API integration)

## 🤝 Contributing

This is an early-stage project. Contributions, issues, and feature requests are welcome!

## 📄 License

MIT

## 🔗 Resources

- [Development Plan](./.cursor/scratchpad.md)
- [Setup Guide](./docs/SETUP.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
