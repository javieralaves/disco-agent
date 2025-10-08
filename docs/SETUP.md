# Disco Setup Guide

This guide will help you set up Disco for local development.

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL 14+ (local or Supabase)
- OpenAI API key
- (Optional) Supabase account for unified database + storage

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd disco-agent
npm install
```

### 2. Set Up Database

#### Option A: Using Supabase (Recommended)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → Database and copy your connection string
3. In the SQL Editor, run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Copy `.env.example` to `.env.local` and update:
   ```
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
   SUPABASE_SERVICE_ROLE_KEY="[your-service-role-key]"
   ```

#### Option B: Local PostgreSQL

1. Install PostgreSQL and pgvector:
   ```bash
   # macOS
   brew install postgresql pgvector
   
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   ```

2. Create database:
   ```bash
   createdb disco
   psql disco -c "CREATE EXTENSION vector;"
   ```

3. Copy `.env.example` to `.env.local` and update:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/disco"
   ```

### 3. Run Migrations

```bash
npm run db:migrate
```

This will:
- Create all database tables
- Set up indexes and relations
- Generate the Prisma client

### 4. Configure Environment Variables

Update `.env.local` with your API keys:

```bash
# Generate a NextAuth secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET="[generated-secret]"
OPENAI_API_KEY="sk-..."
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Commands

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create and run a new migration
npm run db:migrate

# Push schema changes without migration (dev only)
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database (⚠️ deletes all data)
npm run db:reset

# Seed database with sample data
npm run db:seed
```

## Architecture Overview

### Database Models

- **User** - Authentication and account management
- **Series** - Interview series with research goals and questions
- **Session** - Individual interview sessions with participants
- **Turn** - Conversation turns with embeddings for RAG
- **Highlight** - Important quotes extracted from sessions
- **Theme** - Cross-session patterns with confidence scoring
- **Evidence** - Links themes to specific turns/highlights
- **Action** - Tracked integrations (Slack, Linear, etc.)
- **Consent** - Privacy compliance and consent tracking
- **Job** - Background processing queue
- **AuditLog** - Security and compliance audit trail

### Vector Embeddings

The `Turn` and `Highlight` models use pgvector for semantic search:
- Embedding dimension: 3072 (text-embedding-3-large)
- Indexed for fast similarity search
- Powers the RAG-based chat interface

## Troubleshooting

### Prisma Client Not Found

```bash
npm run db:generate
```

### Migration Errors

```bash
# Reset and recreate
npm run db:reset

# Then migrate again
npm run db:migrate
```

### pgvector Extension Missing

For Supabase, run in SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

For local PostgreSQL:
```bash
# macOS
brew install pgvector

# Then in psql:
psql disco -c "CREATE EXTENSION vector;"
```

## Next Steps

1. Set up authentication providers in NextAuth configuration
2. Configure Inngest for background jobs
3. Set up Slack integration (optional)
4. Review the [Development Plan](./.cursor/scratchpad.md)

## Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Supabase Docs](https://supabase.com/docs)
- [pgvector Docs](https://github.com/pgvector/pgvector)
