# Testing Guide - Phase 1 Setup

This guide will help you test all components of Phase 1 to ensure everything is working correctly.

## Prerequisites Checklist

Before testing, ensure you have:

- [ ] Node.js 20+ installed
- [ ] PostgreSQL database (local or Supabase)
- [ ] OpenAI API key (for future AI features)
- [ ] (Optional) Google OAuth credentials
- [ ] (Optional) GitHub OAuth credentials

---

## Step 1: Environment Setup

### 1.1 Create Environment File

```bash
cp .env.example .env.local
```

### 1.2 Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output and add it to `.env.local`:

```
NEXTAUTH_SECRET="paste-your-generated-secret-here"
```

### 1.3 Configure Database

#### Option A: Using Supabase (Recommended)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings → Database
4. Copy the connection string (Direct connection)
5. Add to `.env.local`:

```env
# Use the "Connection String" from Supabase (Transaction mode)
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"

# For migrations, use Direct Connection
# Comment out the above and uncomment this when running migrations:
# DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

6. In Supabase SQL Editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### Option B: Local PostgreSQL

1. Install PostgreSQL and pgvector:

```bash
# macOS
brew install postgresql@14 pgvector

# Start PostgreSQL
brew services start postgresql@14
```

2. Create database:

```bash
createdb disco
psql disco -c "CREATE EXTENSION vector;"
```

3. Add to `.env.local`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/disco?schema=public"
```

### 1.4 Minimal Environment for Testing

For initial testing, you only need:

```env
DATABASE_URL="your-database-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret"
OPENAI_API_KEY="sk-..."  # Can be placeholder for now

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

OAuth providers are optional for testing.

---

## Step 2: Database Migration

### 2.1 Generate Prisma Client

```bash
npm run db:generate
```

Expected output:

```
✔ Generated Prisma Client
```

### 2.2 Run Migrations

**If using Supabase**: Switch to Direct Connection URL first!

```bash
npm run db:migrate
```

You'll be prompted to name the migration. Enter: `init`

Expected output:

```
✔ Migration created successfully
✔ Migration applied successfully
```

### 2.3 Verify Database

Open Prisma Studio to inspect your database:

```bash
npm run db:studio
```

This opens `http://localhost:5555` where you should see all 14 tables:

- users
- accounts
- user_sessions
- verification_tokens
- series
- sessions
- turns
- highlights
- themes
- evidence
- actions
- consents
- jobs
- audit_logs

**✅ Checkpoint**: All tables should be visible with 0 records.

---

## Step 3: Start Development Server

### 3.1 Start the Server

```bash
npm run dev
```

Expected output:

```
▲ Next.js 15.5.4
- Local:        http://localhost:3000
- Experiments (use with caution):
  · turbopack

✓ Ready in 2.5s
```

### 3.2 Test Landing Page

1. Open browser to `http://localhost:3000`
2. **✅ Expected**: Beautiful landing page with:
   - Disco logo and title
   - Hero section with tagline
   - Features section (4 feature cards)
   - CTA sections
   - "Sign In" and "Get Started" buttons in header

**Common Issues**:

- **Module not found errors**: Run `npm install` again
- **Tailwind not working**: Check `src/app/globals.css` exists
- **Components missing**: Verify shadcn components installed

---

## Step 4: Test Authentication

### 4.1 Test Sign-In Page

1. Click "Sign In" button
2. Navigate to `http://localhost:3000/auth/signin`
3. **✅ Expected**: Sign-in page with:
   - Email input field
   - "Sign in with Email" button
   - Google and GitHub OAuth buttons (may not work without credentials)

### 4.2 Test Email Authentication (Magic Link)

**Note**: Email sign-in requires email server configuration. To test:

1. For quick testing, configure Gmail SMTP:

Add to `.env.local`:

```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

2. Enter your email address in the sign-in form
3. Click "Sign in with Email"
4. **✅ Expected**: Redirect to verify-request page
5. Check your email for magic link
6. Click link → Redirect to dashboard

**Skip email testing?** Set up OAuth instead (see 4.3).

### 4.3 Test OAuth (Optional but Recommended)

#### Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Copy Client ID and Secret to `.env.local`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

#### Setup GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create New OAuth App
3. Set Authorization callback URL:
   ```
   http://localhost:3000/api/auth/callback/github
   ```
4. Copy Client ID and Secret to `.env.local`:
   ```env
   GITHUB_ID="your-client-id"
   GITHUB_SECRET="your-client-secret"
   ```

#### Test OAuth Flow

1. Restart dev server (`Ctrl+C`, then `npm run dev`)
2. Go to sign-in page
3. Click "Google" or "GitHub" button
4. **✅ Expected**:
   - Redirect to OAuth provider
   - Authorize the app
   - Redirect back to dashboard
   - See welcome message with your name

---

## Step 5: Test Dashboard

### 5.1 Verify Dashboard Access

After signing in, you should be at `http://localhost:3000/dashboard`

**✅ Expected**:

- Sidebar navigation (desktop) with menu items
- User avatar in top-right corner
- Welcome message: "Welcome back, [Your Name]!"
- Three stats cards (all showing 0)
- "No series yet" empty state
- "Create Series" button

### 5.2 Test Navigation

1. Click on sidebar items:

   - Home → Dashboard (already here)
   - Series → Should navigate to `/series`
   - Themes → Should navigate to `/themes`
   - Chat → Should navigate to `/chat`
   - Settings → Should navigate to `/settings`

2. **Expected**: Navigation works, but Series/Themes/Chat/Settings pages don't exist yet (404 or error is expected).

### 5.3 Test User Menu

1. Click on your avatar in top-right
2. **✅ Expected**: Dropdown menu with:

   - Your name and email
   - "Profile" link
   - "Settings" link
   - "Log out" button

3. Click "Log out"
4. **✅ Expected**: Redirect to landing page, no longer signed in

### 5.4 Test Mobile Navigation

1. Resize browser to mobile width (< 768px)
2. **✅ Expected**:
   - Sidebar hidden
   - Hamburger menu icon visible
3. Click hamburger menu
4. **✅ Expected**: Drawer opens with navigation items

---

## Step 6: Test Database Persistence

### 6.1 Verify User Created

1. Sign in again
2. Open Prisma Studio: `npm run db:studio`
3. Navigate to `users` table
4. **✅ Expected**: Your user record exists with:

   - id
   - email
   - name (if provided by OAuth)
   - createdAt timestamp

5. Check `accounts` table
6. **✅ Expected**: Account record linking to your user

### 6.2 Verify Session Management

1. While signed in, check `user_sessions` table in Prisma Studio
2. **✅ Expected**: Active session record
3. Click "Log out" in the app
4. Refresh Prisma Studio
5. **✅ Expected**: Session record removed or updated

---

## Step 7: Test Protected Routes

### 7.1 Test Middleware

1. Sign out if signed in
2. Try to visit: `http://localhost:3000/dashboard`
3. **✅ Expected**: Redirect to `/auth/signin?callbackUrl=/dashboard`

4. Sign in
5. **✅ Expected**: Redirect back to dashboard

### 7.2 Test Callback URL

1. Sign out
2. Visit: `http://localhost:3000/series/test-123`
3. **✅ Expected**: Redirect to sign-in with callback URL
4. Sign in
5. **✅ Expected**: Redirect to `/series/test-123` (will 404 but URL is correct)

---

## Common Issues & Solutions

### Issue: "PrismaClient is unable to run in the browser"

**Solution**: Make sure you're importing from `@/lib/prisma` in server components only:

```tsx
// ✅ Correct (Server Component)
import { prisma } from "@/lib/prisma";

// ❌ Wrong (Client Component)
("use client");
import { prisma } from "@/lib/prisma"; // Don't do this
```

### Issue: "Module not found: Can't resolve '@/components/ui/button'"

**Solution**: Reinstall shadcn components:

```bash
npx shadcn@latest add button avatar dropdown-menu separator sheet --yes
```

### Issue: NextAuth callback URL error

**Solution**: Ensure `NEXTAUTH_URL` in `.env.local` matches your dev server:

```env
NEXTAUTH_URL="http://localhost:3000"
```

### Issue: Database connection error

**Solution**:

- Verify DATABASE_URL is correct
- For Supabase: Use Transaction pooling URL for app, Direct URL for migrations
- For local: Ensure PostgreSQL is running

### Issue: pgvector extension not found

**Solution**:

- Supabase: Run `CREATE EXTENSION IF NOT EXISTS vector;` in SQL Editor
- Local: `brew install pgvector` then `psql disco -c "CREATE EXTENSION vector;"`

### Issue: OAuth not working

**Solution**:

- Verify redirect URIs match exactly in OAuth provider settings
- Ensure `NEXTAUTH_URL` is set correctly
- Check CLIENT_ID and SECRET are correct
- Restart dev server after changing env vars

---

## Test Checklist

Use this checklist to verify everything is working:

### Environment

- [ ] `.env.local` created with all required variables
- [ ] `NEXTAUTH_SECRET` generated and set
- [ ] Database URL configured

### Database

- [ ] pgvector extension enabled
- [ ] Migrations ran successfully
- [ ] Prisma Studio shows all 14 tables
- [ ] Prisma client generated

### Development Server

- [ ] Server starts without errors
- [ ] No module not found errors
- [ ] No TypeScript errors

### Landing Page

- [ ] Landing page loads at `/`
- [ ] Responsive design works
- [ ] Sign In button navigates to auth page

### Authentication

- [ ] Sign-in page loads at `/auth/signin`
- [ ] Can sign in with email OR OAuth
- [ ] After sign-in, redirects to dashboard
- [ ] User record created in database

### Dashboard

- [ ] Dashboard loads after auth
- [ ] Shows welcome message with user name
- [ ] Stats cards visible
- [ ] Empty state shows for series
- [ ] Navigation sidebar works (desktop)
- [ ] Hamburger menu works (mobile)

### User Menu

- [ ] Avatar shows in header
- [ ] Dropdown menu opens
- [ ] Shows user name and email
- [ ] Log out works

### Protected Routes

- [ ] Unauthenticated users redirect to sign-in
- [ ] Callback URL works after sign-in
- [ ] Signed-in users can access dashboard

### Database Persistence

- [ ] User record persists after sign-in
- [ ] Account record created
- [ ] Sessions tracked in database

---

## Next Steps After Testing

Once all tests pass:

1. **Document any issues** you encountered and how you solved them
2. **Note which auth provider** you're using (email, Google, or GitHub)
3. **Confirm database setup** (Supabase or local)
4. **Ready for Phase 2!** We can start building the Series Creation wizard

---

## Quick Start for Impatient Testers

If you just want to test quickly with minimal setup:

```bash
# 1. Use Supabase (easiest)
# - Create Supabase project
# - Enable vector extension
# - Copy connection strings

# 2. Minimal .env.local
cat > .env.local << 'EOF'
DATABASE_URL="your-supabase-transaction-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
GITHUB_ID="your-github-oauth-id"
GITHUB_SECRET="your-github-oauth-secret"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
EOF

# 3. Run migrations (use Direct URL)
npm run db:migrate

# 4. Start dev server (switch back to Transaction URL)
npm run dev

# 5. Sign in with GitHub at localhost:3000
```

That's it! You should have a fully working authenticated app.

---

**Need help?** Check the logs, refer to [SETUP.md](./SETUP.md), or review the [Phase 1 Summary](./PHASE1-SUMMARY.md).
