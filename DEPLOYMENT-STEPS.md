# 🚀 Deployment Steps for Pre-Interview Questions Feature

This guide covers the deployment of the new pre-interview context questions feature to production.

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ Vercel project set up
- ✅ Production database (PostgreSQL with pgvector)
- ✅ Environment variables configured

## 🔧 Step 1: Configure GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### Required Secrets:

1. **`DATABASE_URL`** - Your production database connection string

   ```
   postgresql://user:password@host:port/database?sslmode=require
   ```

2. **`DIRECT_DATABASE_URL`** - Direct database URL (for migrations)

   ```
   postgresql://user:password@host:port/database?sslmode=require
   ```

3. **`VERCEL_TOKEN`** - Your Vercel deployment token

   - Get it from: https://vercel.com/account/tokens

4. **`VERCEL_ORG_ID`** - Your Vercel organization ID

   - Find in: Vercel project settings → General

5. **`VERCEL_PROJECT_ID`** - Your Vercel project ID
   - Find in: Vercel project settings → General

## 🗄️ Step 2: Database Migration

### Option A: Automatic (via GitHub Actions)

The migration will run automatically when you push to `main`. The workflow:

1. Generates Prisma Client
2. Applies migrations with `prisma migrate deploy`
3. Deploys to Vercel

### Option B: Manual Migration

If you prefer to run migrations manually:

```bash
# Set environment variables
export DATABASE_URL="your-production-db-url"
export DIRECT_DATABASE_URL="your-direct-db-url"

# Run migration
npx prisma migrate deploy

# Verify
npx prisma db pull
```

### Migration Details

The migration adds two new fields:

- `series.preInterviewQuestions` (JSONB) - Stores question definitions
- `sessions.participantContext` (JSONB) - Stores participant answers

**SQL Applied:**

```sql
ALTER TABLE "series" ADD COLUMN "preInterviewQuestions" JSONB;
ALTER TABLE "sessions" ADD COLUMN "participantContext" JSONB;
```

## 🌐 Step 3: Vercel Environment Variables

Ensure these are set in your Vercel project (Settings → Environment Variables):

### Required:

- `DATABASE_URL` - Production database URL
- `DIRECT_DATABASE_URL` - Direct database URL
- `OPENAI_API_KEY` - Your OpenAI API key
- `NEXTAUTH_URL` - Your production URL (e.g., https://disco.example.com)
- `NEXTAUTH_SECRET` - Generated secret (use: `openssl rand -base64 32`)
- `GITHUB_ID` - GitHub OAuth App ID
- `GITHUB_SECRET` - GitHub OAuth App Secret

### Optional:

- `SUPABASE_URL` - If using Supabase
- `SUPABASE_ANON_KEY` - If using Supabase

## 🚀 Step 4: Deploy

### Automatic Deployment (Recommended)

Push to main branch:

```bash
git push origin main
```

The GitHub Action will:

1. ✅ Install dependencies
2. ✅ Generate Prisma Client
3. ✅ Run database migrations
4. ✅ Deploy to Vercel

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## ✅ Step 5: Verify Deployment

### 1. Check Database

```bash
# Connect to production DB and verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'series' AND column_name = 'preInterviewQuestions';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sessions' AND column_name = 'participantContext';
```

### 2. Test the Feature

1. **Create a Series**

   - Go to your production app
   - Create a new research series
   - Verify Step 4 appears: "Pre-Interview Questions"
   - Test AI question generation

2. **Test Participant Flow**

   - Use the invite link as a participant
   - Verify pre-interview questions appear in consent form
   - Answer the questions
   - Start the interview

3. **Test AI Adaptation**
   - Verify the AI acknowledges participant context
   - Check that questions are concrete and situated

### 3. Monitor Logs

```bash
# View Vercel deployment logs
vercel logs --prod

# Check for migration success
# Look for: "✅ Session created: [id]"
#          "  - Participant context: present"
```

## 🔄 Rollback Plan (If Needed)

If issues arise, you can rollback:

### Database Rollback

```sql
ALTER TABLE "series" DROP COLUMN IF EXISTS "preInterviewQuestions";
ALTER TABLE "sessions" DROP COLUMN IF EXISTS "participantContext";
```

### Code Rollback

```bash
# Revert to previous version
git revert <commit-hash>
git push origin main
```

Or use Vercel's instant rollback:

1. Go to Vercel dashboard
2. Select previous deployment
3. Click "Promote to Production"

## 📊 Post-Deployment Monitoring

### Metrics to Watch:

- ✅ Series creation completion rate (Step 4)
- ✅ Pre-interview question response rate
- ✅ AI response quality with context
- ✅ Database query performance
- ✅ Error rates in logs

### Success Indicators:

- [ ] Step 4 renders without errors
- [ ] AI generates questions successfully
- [ ] Participant context saves to database
- [ ] AI uses context in interview intro
- [ ] No increase in error rates

## 🆘 Troubleshooting

### Migration Fails

**Error:** `relation "series" does not exist`

- **Fix:** Run all previous migrations first: `npx prisma migrate deploy`

### AI Doesn't Use Context

**Error:** Context present but AI doesn't acknowledge

- **Fix:** Check that `session.participantContext` is populated
- **Debug:** Add logging in `/api/realtime/session/route.ts`

### Step 4 Not Showing

**Error:** Only 3 steps appear

- **Fix:** Clear browser cache and hard refresh
- **Verify:** Check that `STEPS` array has 4 items in `series/new/page.tsx`

### Environment Variables Missing

**Error:** `DATABASE_URL` not found

- **Fix:** Add to Vercel project settings
- **Redeploy:** Trigger new deployment after adding

## 📞 Support

If you encounter issues:

1. Check GitHub Actions logs: `.github/workflows/deploy-production.yml`
2. Check Vercel deployment logs
3. Review Prisma migration logs
4. Check database connection and permissions

## 🎉 Success!

Once verified, the pre-interview questions feature is live! Users can now:

- ✅ Create series with custom pre-interview questions
- ✅ Let AI generate contextual questions
- ✅ Collect participant background before interviews
- ✅ Experience personalized AI moderation

---

**Feature Deployed:** Pre-Interview Context Questions  
**Database Changes:** 2 new JSONB columns  
**API Changes:** 1 new endpoint + updates to 3 existing  
**UI Changes:** 1 new step + consent form enhancement
