# Disco Development Plan

## Action Plan

This plan builds Disco incrementally, starting with core infrastructure and progressing through each major feature. Each task is designed to be independently testable and safely deployable.

---

## Phase 1: Foundation & Infrastructure (Days 1-3)

### 1.1 Database Setup ✅

- [x] Install and configure PostgreSQL with pgvector extension
- [x] Create database schema for core models: `Series`, `Session`, `Turn`, `Highlight`, `Theme`, `Evidence`, `Action`
- [x] Set up Prisma ORM with type-safe client
- [x] Create initial migration files
- [x] Create Prisma client singleton utility
- [x] Set up database scripts and documentation
- **Success check**: ✅ Prisma client generated; schema ready for migration

### 1.2 Authentication & User Management ✅

- [x] Install and configure authentication library (NextAuth.js)
- [x] Create user model and link to Series ownership
- [x] Implement sign-up/sign-in pages
- [x] Add protected route middleware
- [x] Create session utilities for server components
- [x] Add TypeScript types for NextAuth
- **Success check**: ✅ Auth configured; signin/error/verify pages created; middleware protecting routes

### 1.3 Environment & Configuration ✅

- [x] Set up environment variables for OpenAI, database, storage
- [x] Configure Supabase storage for audio files
- [x] Create configuration utilities (Prisma, Supabase clients)
- [x] Create .env.example with all required variables
- **Success check**: ✅ Environment setup complete; .env.example documented

### 1.4 Core UI Layout ✅

- [x] Create main layout with navigation (Home, Series, Themes, Chat)
- [x] Add responsive sidebar/header using shadcn/ui components
- [x] Implement basic routing structure
- [x] Create dashboard home page with stats
- [x] Create landing page for unauthenticated users
- **Success check**: ✅ Navigation working; responsive layout; dashboard displays user stats

---

## Phase 2: Series Creation (Days 4-5) ✅

### 2.1 Series Wizard - Step 1: Research Focus ✅

- [x] Create wizard component with multi-step form
- [x] Build research focus input page (textarea for focus description)
- [x] Add context fields (company, product, assumptions, hypotheses)
- [x] Implement form validation and state management
- **Success check**: ✅ Can enter research focus and context; form validates properly

### 2.2 Series Wizard - Step 2: Research Goals ✅

- [x] Create API endpoint `/api/series/generate-goals` using GPT-4o
- [x] Display auto-generated goals with edit/add/remove capabilities
- [x] Implement goals list UI with inline editing
- **Success check**: ✅ Goals are generated from research focus; user can edit them

### 2.3 Series Wizard - Step 3: Questions ✅

- [x] Create question generation endpoint per research goal
- [x] Build questions UI (grouped by goal, drag-to-reorder)
- [x] Add manual question addition/editing
- **Success check**: ✅ Questions generated and editable; order can be changed

### 2.4 Series Completion & Dashboard ✅

- [x] Create Series model record on wizard completion
- [x] Generate unique shareable invite link with UUID
- [x] Build series dashboard showing: invite link, sessions list, metrics
- [x] Add consent text editor and retention policy selector
- **Success check**: ✅ Series created in DB; invite link is shareable; dashboard displays

---

## Phase 3: Interview Capture (Days 6-10) ✅

### 3.1 Participant Landing Page ✅

- [x] Create `/interview/[inviteCode]` route for participants
- [x] Display purpose, estimated time, and incentive
- [x] Show consent form with checkbox and version tracking
- [x] Add mic check component with audio level visualization
- [x] Create `/api/interview/consent` endpoint for session creation
- **Success check**: ✅ Landing page built; consent form creates session; mic check visualizes audio levels

### 3.2 OpenAI Realtime Integration - Backend ✅

- [x] Create `/api/realtime/session` endpoint to generate ephemeral tokens
- [x] Set up OpenAI Realtime API configuration (model, voice, turn detection)
- [x] Implement session initialization with research questions context
- [x] Build comprehensive interviewer instructions with research goals
- **Success check**: ✅ Endpoint creates ephemeral tokens; session transitions to IN_PROGRESS

### 3.3 WebRTC Interview Interface ✅

- [x] Build WebRTC audio capture component with mic streaming
- [x] Integrate OpenAI Realtime API via WebSocket
- [x] Implement audio streaming (PCM16 format)
- [x] Add real-time transcription display
- [x] Create mic mute/unmute controls
- [x] Build interview UI with conversation transcript
- [x] Add AI speaking indicator
- **Success check**: ✅ WebSocket connects; audio streams; transcripts display in real-time

### 3.4 Interview Session Management ✅

- [x] Create Session record on interview start
- [x] Stream Turn records to database as conversation progresses
- [x] Implement PII redaction filter (regex-based for emails/phones)
- [ ] Add graceful disconnect/reconnect handling (deferred to post-MVP)
- **Success check**: ✅ Turns saved to DB; PII is redacted (emails, phone numbers)

### 3.5 Session Completion ✅

- [ ] Save raw audio to S3/Supabase with encryption (deferred to post-MVP)
- [x] Mark session as complete in database
- [x] Calculate and store session duration
- [x] Show thank-you page to participant
- **Success check**: ✅ Session marked COMPLETED; duration calculated; thank-you page displays

---

## Phase 4: Background Processing (Days 11-12)

### 4.1 Job Queue Setup

- [ ] Install and configure Inngest or Vercel Queues
- [ ] Create job pipeline: `ingest → transcribe → summarize → embed → theme update`
- [ ] Implement idempotent job handlers with retry logic
- **Success check**: Jobs can be enqueued and executed; retries work on failure

### 4.2 Transcription Job

- [ ] Implement transcription using gpt-4o-mini-transcribe (fallback: Whisper)
- [ ] Update Turn records with refined transcripts
- [ ] Handle timestamp alignment
- **Success check**: Raw audio transcribed; Turn.text updated with timestamps

### 4.3 Summarization Job

- [ ] Create GPT-4o prompt for structured summary (Problems/Goals/Friction/Opportunities)
- [ ] Generate session highlights (top 3-5 quotes)
- [ ] Extract suggested actions
- [ ] Update Session record with summary data
- **Success check**: Session has summary, highlights, and suggested actions in DB

### 4.4 Embedding Job

- [ ] Generate embeddings for each Turn using text-embedding-3-large
- [ ] Store embeddings in pgvector columns
- [ ] Create vector index for similarity search
- **Success check**: Turn embeddings stored; similarity queries return relevant results

### 4.5 Theme Update Job

- [ ] Analyze all sessions in series for recurring patterns
- [ ] Create/update Theme records with confidence scores
- [ ] Link Evidence records (Theme ↔ Turn/Highlight)
- [ ] Calculate confidence: volume × diversity × recency × consistency − contradiction
- **Success check**: Themes auto-generated; confidence scores calculated; evidence linked

---

## Phase 5: Session Review (Days 13-14)

### 5.1 Sessions List View

- [ ] Create `/series/[id]/sessions` page
- [ ] Display sessions table: summary line, duration, highlights, sentiment
- [ ] Add filters (date, completion status, sentiment)
- [ ] Implement sorting and pagination
- **Success check**: All sessions visible; filtering and sorting work

### 5.2 Session Detail View

- [ ] Create `/session/[id]` page
- [ ] Display full transcript with timestamp navigation
- [ ] Show structured summary (Problems/Goals/Friction/Opportunities)
- [ ] List highlights with copy-to-clipboard buttons
- [ ] Display suggested actions
- **Success check**: Transcript readable; can copy individual turns; highlights visible

### 5.3 Transcript Interactions

- [ ] Add turn-level copy-to-clipboard
- [ ] Implement jump-to-timestamp functionality
- [ ] Highlight search within transcript
- **Success check**: Can copy any turn; clicking timestamp plays audio at that point

---

## Phase 6: Themes & Synthesis (Days 15-16)

### 6.1 Theme Board

- [ ] Create `/themes` page showing all themes across all series
- [ ] Display theme cards: title, confidence %, session count, top quote
- [ ] Add filters by series, confidence level, date range
- **Success check**: Themes visible; filtering works; confidence % accurate

### 6.2 Theme Detail Page

- [ ] Create `/theme/[id]` page
- [ ] Display rationale and contributing factors
- [ ] List evidence with jump-to citations (e.g., `[S12@03:14]`)
- [ ] Show proposed experiments
- **Success check**: Theme rationale clear; evidence clickable; leads to session/turn

### 6.3 Confidence Calculation Refinement

- [ ] Implement detailed confidence algorithm
- [ ] Add visual indicators for confidence levels
- [ ] Show confidence breakdown tooltip (volume, diversity, etc.)
- **Success check**: Confidence scores are accurate and explainable

---

## Phase 7: Chat & RAG (Days 17-19)

### 7.1 Chat Interface

- [ ] Create chat component with scope selector (global/series/session/theme)
- [ ] Add "Open chat" buttons in multiple contexts
- [ ] Implement text and voice input modes
- [ ] Build chat message history UI
- **Success check**: Chat UI opens with correct scope; messages display

### 7.2 RAG Backend

- [ ] Create `/api/chat` endpoint with streaming support
- [ ] Implement vector search over turns/highlights filtered by scope
- [ ] Build GPT-4o prompt with retrieved context
- [ ] Generate answers with inline citations `[S12@03:14]`
- **Success check**: Queries return relevant answers with accurate citations

### 7.3 Citation Linking

- [ ] Make citations clickable (jump to session/turn)
- [ ] Highlight referenced turn when navigating from citation
- [ ] Add hover preview of cited content
- **Success check**: Clicking citation navigates to exact turn; context visible

---

## Phase 8: Actions & Integrations (Days 20-21)

### 8.1 MCP Server Setup

- [ ] Create standalone MCP server with standard protocol
- [ ] Implement `slack.postMessage` tool
- [ ] Add authentication for Slack workspace
- **Success check**: MCP server runs; Slack integration works

### 8.2 Slack Integration

- [ ] Create "Send to Slack" action on session/theme pages
- [ ] Build channel selector modal
- [ ] Format summary message with highlights and link
- [ ] Implement human-in-the-loop confirmation (unless series is Trusted)
- **Success check**: Can send session summary to Slack channel; message formatted well

### 8.3 Action Tracking

- [ ] Create Action model records when actions are taken
- [ ] Display action history on series dashboard
- [ ] Add audit log for all external tool calls
- **Success check**: Actions logged; visible in audit trail

---

## Phase 9: Security & Privacy (Days 22-23)

### 9.1 Consent Management

- [ ] Implement consent versioning system
- [ ] Store participant consent records with timestamps
- [ ] Add consent withdrawal flow
- **Success check**: Consent versions tracked; participants can withdraw

### 9.2 PII Redaction Enhancement

- [ ] Refine real-time PII redaction using GPT-4o
- [ ] Add whitelistable fields configuration per series
- [ ] Implement redaction markers in transcripts
- **Success check**: PII automatically redacted; whitelisted fields preserved

### 9.3 Data Retention & Deletion

- [ ] Implement per-series retention policy enforcement
- [ ] Create participant data deletion endpoint
- [ ] Set up lifecycle rules for S3 audio bucket
- [ ] Add encryption at rest for raw audio
- **Success check**: Data auto-deletes per policy; participant delete works; audio encrypted

---

## Phase 10: Observability & Quality (Days 24-25)

### 10.1 Logging & Tracing

- [ ] Set up structured logging with series_id/session_id context
- [ ] Implement distributed tracing for background jobs
- [ ] Add metrics collection (completion %, drop rate, STT latency)
- **Success check**: Logs are structured; can trace a session through pipeline

### 10.2 Evals & Quality Monitoring

- [ ] Create OpenAI Evals for summary factuality
- [ ] Implement highlight usefulness scoring
- [ ] Add action relevance evaluation
- [ ] Build Insights dashboard showing eval scores
- [ ] Set thresholds for manual review alerts
- **Success check**: Evals run nightly; scores visible in dashboard; alerts trigger

---

## Phase 11: Polish & Testing (Days 26-28)

### 11.1 End-to-End Testing

- [ ] Write E2E tests for series creation flow
- [ ] Test complete interview session (voice and text modes)
- [ ] Verify session review and theme generation
- [ ] Test chat with citations
- **Success check**: E2E tests pass; all flows work end-to-end

### 11.2 Error Handling & UX Polish

- [ ] Add loading states for all async operations
- [ ] Implement error boundaries and fallback UIs
- [ ] Add toast notifications for actions
- [ ] Refine empty states and onboarding
- **Success check**: No broken states; errors handled gracefully; UX feels polished

### 11.3 Performance Optimization

- [ ] Add database indexes for common queries
- [ ] Implement query result caching where appropriate
- [ ] Optimize vector searches with filtered indexes
- [ ] Add lazy loading for long lists
- **Success check**: Pages load under 2s; searches return under 1s

### 11.4 Documentation

- [ ] Write README with setup instructions
- [ ] Document environment variables
- [ ] Create API documentation
- [ ] Add inline code comments for complex logic
- **Success check**: New developer can set up project from README

---

## Progress

### ✅ Completed

**Phase 1: Foundation & Infrastructure**

- **1.1 Database Setup** ✅

  - Installed Prisma and @prisma/client
  - Created comprehensive database schema with 14 models
  - Set up pgvector extension support for embeddings
  - Created Prisma client singleton (`src/lib/prisma.ts`)
  - Created Supabase client utilities (`src/lib/supabase.ts`)
  - Added database scripts to package.json
  - Created setup documentation (`docs/SETUP.md`)
  - Updated main README with project overview

- **1.2 Authentication & User Management** ✅
  - Installed NextAuth.js and Prisma adapter
  - Created auth configuration with Google, GitHub, and Email providers
  - Built signin, error, and verify-request pages
  - Implemented middleware for protected routes
  - Created session utilities for server components
- **1.3 Environment & Configuration** ✅

  - Created .env.example with all required variables
  - Set up Supabase and Prisma client utilities
  - Configured environment for OpenAI, database, auth, and storage

- **1.4 Core UI Layout** ✅
  - Installed shadcn/ui components (Button, Avatar, DropdownMenu, Separator, Sheet)
  - Created responsive sidebar navigation
  - Built user navigation menu with profile/settings
  - Created mobile navigation with drawer
  - Built dashboard layout with header and sidebar
  - Created dashboard home page with user stats
  - Created landing page with features and CTAs

**Phase 1: Foundation & Infrastructure** ✅ COMPLETE (Tasks 1.1-1.4)

### 🚧 In Progress

**Phase 2: Series Creation**

- **2.1 Series Wizard - Step 1** - Starting next...

---

## Notes & Decisions

- **Tech Stack Confirmed**:
  - Frontend: Next.js 15 with App Router ✓ (already in package.json)
  - UI: shadcn/ui + Tailwind CSS ✓ (partially set up)
  - Database: PostgreSQL + Prisma + pgvector
  - Auth: TBD (NextAuth.js vs Clerk)
  - Storage: TBD (S3 vs Supabase)
  - Jobs: TBD (Inngest vs Vercel Queues)
- **Key Dependencies to Add**:

  - `@prisma/client`, `prisma`
  - `openai` SDK
  - `@auth/nextjs` or `@clerk/nextjs`
  - `@ai-sdk/openai` for streaming
  - Job queue library
  - WebRTC libraries

- **Tech Stack Decisions** ✅:
  1. Auth: **NextAuth.js** - Simple, open-source, excellent Next.js integration
  2. Storage: **Supabase** - Unified Postgres + object storage + pgvector support
  3. Jobs: **Inngest** - Superior observability and developer experience
  4. Hosting: **Vercel** - Optimal Next.js performance and deployment

---

## Estimated Timeline

- **Phase 1**: 3 days (Foundation)
- **Phase 2**: 2 days (Series Creation)
- **Phase 3**: 5 days (Interview Capture - most complex)
- **Phase 4**: 2 days (Background Processing)
- **Phase 5**: 2 days (Session Review)
- **Phase 6**: 2 days (Themes)
- **Phase 7**: 3 days (Chat & RAG)
- **Phase 8**: 2 days (Integrations)
- **Phase 9**: 2 days (Security)
- **Phase 10**: 2 days (Observability)
- **Phase 11**: 3 days (Polish & Testing)

**Total**: ~28 working days (~6 weeks with buffer)

This assumes one experienced full-stack developer working full-time.
