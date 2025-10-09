# 🚀 Disco - Vercel Deployment Guide

## Pre-Deployment Checklist

✅ All features tested and working locally  
✅ No linter errors  
✅ Build scripts updated with Prisma generation  
✅ Git repository ready for push  

---

## Step 1: Prepare Production Secrets

### 1.1 Generate Production NEXTAUTH_SECRET

Run this command and save the output:

```bash
openssl rand -base64 32
```

**Save this value** - you'll need it for Vercel environment variables.

### 1.2 Create Production GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in:
   - **Application name**: `Disco - Production`
   - **Homepage URL**: `https://your-domain.vercel.app` (you'll update this after deployment)
   - **Authorization callback URL**: `https://your-domain.vercel.app/api/auth/callback/github`
4. Click "Register application"
5. **Save the Client ID**
6. Click "Generate a new client secret" and **save the Client Secret**

---

## Step 2: Commit and Push Your Code

```bash
# Add all files
git add .

# Commit with a meaningful message
git commit -m "feat: complete pre-deployment polish and feature additions"

# Push to main branch
git push origin main
```

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect Next.js settings
4. **Before clicking Deploy**, add environment variables (see Step 4)
5. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Deploy to production
vercel --prod
```

---

## Step 4: Configure Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables**

Add the following (select **Production** environment for each):

### Database & Supabase
```
DATABASE_URL = postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
NEXT_PUBLIC_SUPABASE_URL = https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY = [YOUR_SERVICE_ROLE_KEY]
```

### Authentication
```
NEXTAUTH_URL = https://your-project.vercel.app
NEXTAUTH_SECRET = [Generated from openssl command]
GITHUB_ID = [Production OAuth App Client ID]
GITHUB_SECRET = [Production OAuth App Client Secret]
```

### OpenAI
```
OPENAI_API_KEY = sk-proj-[YOUR_KEY]
```

**Important Notes:**
- Remove quotes from all values
- Use your actual Vercel domain for `NEXTAUTH_URL`
- After first deployment, update `NEXTAUTH_URL` with your actual Vercel URL
- Update GitHub OAuth callback URL with your actual Vercel URL

---

## Step 5: Update GitHub OAuth Callback URL

After deployment:

1. Go to your GitHub OAuth App settings
2. Update the **Authorization callback URL** to: `https://[your-vercel-url]/api/auth/callback/github`
3. Update the **Homepage URL** to: `https://[your-vercel-url]`
4. Save changes

---

## Step 6: Verify Deployment

### 6.1 Test Authentication
- [ ] Navigate to your Vercel URL
- [ ] Click "Sign in with GitHub"
- [ ] Authorize the app
- [ ] Verify you're redirected to dashboard

### 6.2 Test Core Features
- [ ] Create a new series
- [ ] Verify AI generates goals and questions
- [ ] Toggle series status (DRAFT → ACTIVE)
- [ ] Share invite link and test interview flow
- [ ] Complete an interview
- [ ] Verify auto-summarization works
- [ ] Generate themes (with 2+ sessions)

### 6.3 Check Logs
```bash
vercel logs --prod
```

Look for any errors or warnings.

---

## Step 7: Enable Monitoring

### Vercel Analytics
1. Go to your project in Vercel Dashboard
2. Click "Analytics" tab
3. Enable Web Analytics (free tier available)

### Database Monitoring
1. Go to Supabase Dashboard
2. Check "Database" → "Performance"
3. Set up alerts for high usage if needed

---

## Common Issues & Solutions

### Issue: Build fails with Prisma error
**Solution**: Ensure `DATABASE_URL` is set in Vercel environment variables and `postinstall` script runs `prisma generate`.

### Issue: GitHub OAuth doesn't work
**Solution**: 
1. Verify callback URL matches exactly: `https://[vercel-url]/api/auth/callback/github`
2. Check `NEXTAUTH_URL` environment variable matches your Vercel URL
3. Ensure `NEXTAUTH_SECRET` is set

### Issue: OpenAI API calls fail
**Solution**: 
1. Verify `OPENAI_API_KEY` is set correctly (no quotes)
2. Check OpenAI API usage limits
3. Review Vercel logs for specific error messages

### Issue: Database connection fails
**Solution**:
1. Check `DATABASE_URL` format is correct
2. Verify Supabase project is accessible from Vercel's IP ranges
3. Ensure pgvector extension is enabled in Supabase

---

## Post-Deployment Tasks

- [ ] Share production URL with initial users
- [ ] Monitor Vercel logs for first 24 hours
- [ ] Check Supabase database usage
- [ ] Monitor OpenAI API costs
- [ ] Gather user feedback
- [ ] Plan next iteration

---

## Rollback Plan

If issues arise:

### Via Vercel Dashboard:
1. Go to "Deployments"
2. Find the last working deployment
3. Click "..." → "Promote to Production"

### Via CLI:
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

---

## Environment Variables Checklist

Before deploying, ensure you have all values for:

- [ ] `DATABASE_URL` (from Supabase)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (from Supabase)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from Supabase)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (from Supabase)
- [ ] `NEXTAUTH_URL` (your Vercel URL)
- [ ] `NEXTAUTH_SECRET` (generated with openssl)
- [ ] `GITHUB_ID` (from GitHub OAuth App)
- [ ] `GITHUB_SECRET` (from GitHub OAuth App)
- [ ] `OPENAI_API_KEY` (from OpenAI)

---

## Success Criteria

Your deployment is successful when:

✅ Application loads at Vercel URL  
✅ Users can sign in with GitHub  
✅ Series creation works with AI generation  
✅ Interviews work end-to-end  
✅ Auto-summarization triggers after interviews  
✅ Theme generation works with 2+ sessions  
✅ No critical errors in logs  

---

## Quick Reference Commands

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View production logs
vercel logs --prod

# Pull environment variables to local
vercel env pull .env.local

# Add environment variable
vercel env add VARIABLE_NAME production
```

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review Supabase logs
3. Check OpenAI API usage
4. Verify all environment variables are set correctly
5. Test locally with production environment variables

---

## Next Steps After Successful Deployment

1. **Custom Domain** (Optional)
   - Add custom domain in Vercel
   - Update `NEXTAUTH_URL` and GitHub OAuth callback

2. **Team Onboarding**
   - Share production URL
   - Provide user guide
   - Set up feedback channels

3. **Monitoring Setup**
   - Set up error tracking (e.g., Sentry)
   - Configure alerts for critical issues
   - Monitor costs (Vercel, Supabase, OpenAI)

4. **Iterate Based on Feedback**
   - Gather user insights
   - Prioritize improvements
   - Plan next release

---

🎉 **Congratulations on deploying Disco!** 🎉

Your research interview platform is now live and ready for users!

