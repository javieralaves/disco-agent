# 🚀 Quick Start - Testing Your Disco Setup

Your setup is almost ready! Follow these simple steps.

## ✅ Already Done

- [x] Environment file created (`.env.local`)
- [x] NextAuth secret generated
- [x] Dependencies installed
- [x] Prisma client generated

## 📋 Next Steps (Choose Your Path)

### Option A: Supabase (Recommended - 5 minutes)

**Best for**: Quick testing, no local database needed

1. **Create Supabase Project** (2 min)

   - Go to [supabase.com](https://supabase.com)
   - Sign in with GitHub
   - Click "New Project"
   - Choose a name (e.g., "disco-dev")
   - Set a database password (save it!)
   - Wait ~2 minutes for setup

2. **Get Connection Strings** (1 min)

   - Go to Project Settings (⚙️ icon) → Database
   - Copy these three values:
     - **Connection String** → Use this for `DATABASE_URL`
     - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
     - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role** key (click "Reveal") → Use for `SUPABASE_SERVICE_ROLE_KEY`

3. **Enable pgvector** (1 min)

   - In Supabase, go to SQL Editor
   - Click "New Query"
   - Paste and run:
     ```sql
     CREATE EXTENSION IF NOT EXISTS vector;
     ```
   - Should see "Success. No rows returned"

4. **Update .env.local**

   ```bash
   # Open .env.local and replace:
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres"
   NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
   SUPABASE_SERVICE_ROLE_KEY="eyJ..."
   ```

5. **Run Migrations**

   ```bash
   npm run db:migrate
   # When prompted, name it: init
   ```

6. **Start Server**

   ```bash
   npm run dev
   ```

7. **Test!**
   - Open http://localhost:3000
   - You'll see the landing page but can't sign in yet (auth not configured)

---

### Option B: Local PostgreSQL (Advanced)

**Best for**: Offline development, learning

1. **Install PostgreSQL + pgvector**

   ```bash
   brew install postgresql@14 pgvector
   brew services start postgresql@14
   ```

2. **Create Database**

   ```bash
   createdb disco
   psql disco -c "CREATE EXTENSION vector;"
   ```

3. **Update .env.local**

   ```bash
   # DATABASE_URL is already set correctly for local:
   # DATABASE_URL="postgresql://postgres:postgres@localhost:5432/disco"
   ```

4. **Run Migrations**

   ```bash
   npm run db:migrate
   # When prompted, name it: init
   ```

5. **Start Server**
   ```bash
   npm run dev
   ```

---

## 🔐 Add Authentication (Optional but Recommended)

Without auth, you can see the landing page but can't sign in. Choose one:

### GitHub OAuth (Easiest - 2 minutes)

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Disco Dev
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy **Client ID** and generate **Client Secret**
6. Add to `.env.local`:
   ```bash
   GITHUB_ID="your-client-id"
   GITHUB_SECRET="your-client-secret"
   ```
7. Restart server: `npm run dev`

### Google OAuth (Alternative)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

---

## 🧪 Test Everything

Once you have database + auth configured:

### Test 1: Landing Page

```bash
# Server should be running: npm run dev
# Visit: http://localhost:3000
```

**Expected**: Beautiful landing page with features

### Test 2: Sign In

```bash
# Click "Sign In" button
# OR visit: http://localhost:3000/auth/signin
```

**Expected**: Sign-in page with GitHub/Google buttons

### Test 3: Authentication

```bash
# Click "GitHub" or "Google"
# Authorize the app
```

**Expected**:

- Redirect to OAuth provider
- Approve access
- Redirect back to dashboard
- See "Welcome back, [Your Name]!"

### Test 4: Dashboard

**Expected**:

- Sidebar navigation (Home, Series, Themes, Chat, Settings)
- User avatar in top-right
- Three stats cards (all showing 0)
- "No series yet" message
- "Create Series" button

### Test 5: Database

```bash
# Open Prisma Studio
npm run db:studio
# Visit: http://localhost:5555
```

**Expected**:

- See your user in `users` table
- See account record in `accounts` table
- See session in `user_sessions` table

### Test 6: User Menu

```bash
# Click your avatar in dashboard
```

**Expected**:

- Dropdown with your name/email
- Profile and Settings links
- Log out button

### Test 7: Mobile View

```bash
# Resize browser to < 768px width
```

**Expected**:

- Sidebar hides
- Hamburger menu appears
- Click to open drawer navigation

---

## 🐛 Troubleshooting

### "Module not found" errors

```bash
npm install
npm run dev
```

### "Prisma Client not found"

```bash
npm run db:generate
```

### "Can't connect to database"

- Check `DATABASE_URL` in `.env.local`
- For Supabase: Ensure you're using the Transaction mode URL
- For local: Ensure PostgreSQL is running

### "pgvector extension not found"

- Supabase: Run `CREATE EXTENSION vector;` in SQL Editor
- Local: `brew install pgvector`

### Can't sign in / OAuth errors

- Verify redirect URIs in OAuth provider match exactly
- Ensure `NEXTAUTH_URL="http://localhost:3000"`
- Restart dev server after changing `.env.local`

### Changes not appearing

```bash
# Hard refresh browser
# Or clear cache
# Or restart dev server
```

---

## 📚 Documentation

- **Detailed Testing**: [docs/TESTING-GUIDE.md](docs/TESTING-GUIDE.md)
- **Setup Instructions**: [docs/SETUP.md](docs/SETUP.md)
- **Phase 1 Summary**: [docs/PHASE1-SUMMARY.md](docs/PHASE1-SUMMARY.md)
- **Development Plan**: [.cursor/scratchpad.md](.cursor/scratchpad.md)

---

## ✅ Success Checklist

Before moving to Phase 2, verify:

- [ ] Database connected and migrations run
- [ ] Can view landing page
- [ ] Can sign in with GitHub or Google
- [ ] Dashboard shows after sign-in
- [ ] User record visible in Prisma Studio
- [ ] Navigation works (sidebar and mobile)
- [ ] Can log out successfully
- [ ] Protected routes redirect to sign-in when not authenticated

**All checked?** You're ready for Phase 2! 🎉

---

## 🎯 Minimal Working Setup

If you want the absolute minimum to test:

```bash
# 1. Use Supabase (free tier)
# 2. Only configure these in .env.local:
DATABASE_URL="your-supabase-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="vpq6GVPIdnjoCS7rdEudT0DAj/JV7c3lfVuEnP7/6qc="
GITHUB_ID="your-github-oauth-id"
GITHUB_SECRET="your-github-oauth-secret"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# 3. Run migrations
npm run db:migrate

# 4. Start server
npm run dev

# 5. Sign in at localhost:3000
```

That's it! Enjoy testing Disco! 🎵
