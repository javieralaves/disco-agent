# Disco Development Plan

## 🎉 Current Status: READY FOR PRODUCTION DEPLOYMENT

Disco is feature-complete for MVP and ready to deploy to Vercel. All core features are built, tested, and polished.

**📍 See `READY-FOR-DEPLOYMENT.md` for deployment instructions**

---

## Completed Work Summary

Phases 1-5 are complete, with additional polish and improvements. The platform now includes:

- ✅ Complete authentication with GitHub OAuth
- ✅ AI-powered series creation with GPT-4o
- ✅ Real-time interviews using OpenAI Realtime API
- ✅ Automatic session summarization
- ✅ Cross-session theme synthesis
- ✅ Clean, consistent navigation and routing
- ✅ Production-ready build configuration

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

## Phase 4: Session Summarization (Days 11-12) ✅

### 4.1 Summarization API Endpoint ✅

- [x] Create `/api/session/summarize` endpoint
- [x] Build GPT-4o prompt for structured summary (Problems/Goals/Friction/Opportunities)
- [x] Generate session highlights (top 3-5 quotes)
- [x] Extract suggested actions with rationale
- [x] Update Session record with summary data
- **Success check**: ✅ Session has summary, highlights, sentiment, and suggested actions in DB

### 4.2 Sessions List View ✅

- [x] Create `/dashboard/sessions` page
- [x] Display sessions list with metadata (participant, duration, turns)
- [x] Show summarization status badges
- [x] Add links to session details
- **Success check**: ✅ All completed sessions visible; status clearly indicated

### 4.3 Session Detail View ✅

- [x] Create `/dashboard/sessions/[id]` page
- [x] Display full transcript with speaker identification
- [x] Show structured summary (Problems/Goals/Friction/Opportunities)
- [x] List highlights with supporting quotes
- [x] Display suggested actions with priorities
- [x] Add sentiment badge
- **Success check**: ✅ Complete session view with AI-powered insights

### 4.4 Manual Summarization Trigger ✅

- [x] Create "Generate Summary" button component
- [x] Implement loading states and error handling
- [x] Auto-refresh page after completion
- **Success check**: ✅ On-demand summarization works; UI updates automatically

### 4.5 Navigation Enhancement ✅

- [x] Add "Sessions" link to sidebar
- [x] Update navigation highlighting
- **Success check**: ✅ Sessions accessible from main navigation

**Deferred to Post-MVP:**

- Embeddings for semantic search
- Background job queue (using simple API endpoints for now)
- Batch processing of multiple sessions
- Theme synthesis (moved to Phase 5)

---

## Phase 5: Theme Synthesis (Days 13-14) ✅

### 5.1 Theme Generation API ✅

- [x] Create `/api/series/generate-themes` endpoint
- [x] Use GPT-4o to analyze patterns across sessions
- [x] Extract evidence with specific quotes
- [x] Calculate confidence scores (volume, diversity, recency, consistency)
- [x] Create Theme and Evidence records
- **Success check**: ✅ Themes generated with multi-factor confidence scoring

### 5.2 Themes List Page ✅

- [x] Create `/dashboard/themes` page showing all themes
- [x] Display theme cards with confidence %, session count, evidence count
- [x] Color-coded confidence badges (green/blue/yellow)
- [x] Sort by confidence (highest first)
- **Success check**: ✅ Themes visible with color-coded confidence

### 5.3 Theme Detail Page ✅

- [x] Create `/dashboard/themes/[id]` page
- [x] Display rationale and contributing factors
- [x] Show confidence breakdown (volume, diversity, consistency)
- [x] List evidence organized by session with quotes
- [x] Link to source sessions
- **Success check**: ✅ Complete theme view with evidence traceability

### 5.4 Theme Generation Trigger ✅

- [x] Add "Generate Themes" button to series detail page
- [x] Implement loading states and error handling
- [x] Auto-navigate to themes page after completion
- **Success check**: ✅ One-click theme generation from series page

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

## Recent Updates & Polish (Pre-Deployment)

### ✅ Navigation & Routing Improvements
- Moved `/dashboard/themes` → `/themes` for cleaner URLs
- Moved `/dashboard/sessions` → `/sessions` 
- Created `/series` list page
- Added consistent dashboard layout to all pages
- Updated all internal links to new routes

### ✅ Series Management Enhancements
- Series status toggle (DRAFT ↔ ACTIVE) from UI
- Sessions list in series detail page
- Themes list in series detail page
- Conditional theme generation (requires 2+ sessions)

### ✅ Interview Flow Improvements
- Participant name capture in consent form
- Auto-scroll transcript with "Jump to Bottom" button
- Fixed research goals flickering issue
- Enhanced audio quality and echo cancellation

### ✅ Automation Features
- Auto-summarization after interview completion (background)
- Sequential turn saving queue (prevents race conditions)
- Improved AI response handling

### ✅ Production Readiness
- Build scripts updated for Vercel (Prisma generation)
- Comprehensive deployment documentation
- Helper scripts for deployment preparation
- All code committed and pushed to GitHub

---

## Progress Summary

### ✅ Phase 1: Foundation & Infrastructure - COMPLETE
- Database setup with Prisma & PostgreSQL
- Authentication with NextAuth.js & GitHub OAuth
- Environment configuration
- Core UI layout with responsive navigation

### ✅ Phase 2: Series Creation - COMPLETE
- Multi-step wizard (Research Focus → Goals → Questions)
- AI-powered goal generation (GPT-4o)
- AI-powered question generation
- Series dashboard with invite links

### ✅ Phase 3: Interview Capture - COMPLETE
- Participant landing page with consent
- OpenAI Realtime API integration
- WebRTC real-time interview interface
- Turn-by-turn conversation storage
- PII redaction (emails, phone numbers)
- Session completion flow

### ✅ Phase 4: Session Summarization - COMPLETE
- GPT-4o powered session summarization
- Structured insights (Problems/Goals/Friction/Opportunities)
- Highlight extraction
- Suggested actions generation
- Sessions list and detail pages
- Auto-summarization after interviews

### ✅ Phase 5: Theme Synthesis - COMPLETE
- Cross-session pattern analysis with GPT-4o
- Multi-factor confidence scoring
- Evidence extraction with quote traceability
- Themes list and detail pages
- One-click theme generation

---

## 🚀 Next Steps: Production Deployment

### Manual Steps Required (User Action)

1. **Generate Production Secrets**
   ```bash
   openssl rand -base64 32  # For NEXTAUTH_SECRET
   ```

2. **Create Production GitHub OAuth App**
   - Go to: https://github.com/settings/developers
   - Create new OAuth app with production callback URL

3. **Deploy to Vercel**
   - Import repository at https://vercel.com/new
   - Add environment variables
   - Deploy

4. **Post-Deployment**
   - Update GitHub OAuth callback URL
   - Test all features
   - Enable Vercel Analytics

**📚 See `READY-FOR-DEPLOYMENT.md` for step-by-step instructions**

---

## 🔄 Post-MVP Roadmap (Future Phases)

### Phase 6: RAG-Powered Chat (Future)
- Chat interface with scope selector (series/session/theme)
- Vector search over turns and highlights
- GPT-4o with RAG for accurate, cited answers
- Citation linking to specific turns

### Phase 7: Advanced Features (Future)
- Audio storage with encryption (Supabase)
- Embeddings for semantic search (pgvector)
- Background job queue (Inngest)
- Batch processing for multiple sessions
- Custom domain support

### Phase 8: Integrations & Actions (Future)
- Slack integration for sharing insights
- MCP server setup
- Action tracking and audit logs
- Human-in-the-loop confirmations

### Phase 9: Enhanced Security (Future)
- Advanced PII redaction with GPT-4o
- Consent versioning and withdrawal
- Data retention policy automation
- Encryption at rest for audio

### Phase 10: Quality & Monitoring (Future)
- OpenAI Evals for summary quality
- Structured logging and tracing
- Quality metrics dashboard
- Manual review alerts

---

## Tech Stack (Finalized)

- **Frontend**: Next.js 15 (App Router) + React 19
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM + pgvector
- **Auth**: NextAuth.js + GitHub OAuth
- **Storage**: Supabase (PostgreSQL + Object Storage)
- **AI**: OpenAI (GPT-4o + Realtime API)
- **Hosting**: Vercel
- **Future**: Inngest (background jobs)

---

## Deferred to Post-MVP

- Audio file storage (currently transcription-only)
- Vector embeddings for semantic search
- Background job queue (using simple API endpoints)
- RAG-powered chat interface
- Slack/external integrations
- Advanced PII redaction
- Data retention automation
- Quality monitoring dashboard

These will be prioritized based on user feedback after initial deployment.

---

## Development Timeline (Actual)

- **Phase 1**: Foundation & Infrastructure ✅ (3 days)
- **Phase 2**: Series Creation ✅ (2 days)
- **Phase 3**: Interview Capture ✅ (5 days)
- **Phase 4**: Session Summarization ✅ (2 days)
- **Phase 5**: Theme Synthesis ✅ (2 days)
- **Pre-Deployment**: Polish & Testing ✅ (2 days)

**Total MVP**: ~16 working days completed

**Next**: Production deployment → User feedback → Iterate
