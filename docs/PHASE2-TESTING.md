# Testing the Series Creation Wizard

This guide will walk you through testing the complete Series Creation Wizard feature.

## Prerequisites

### 1. Environment Setup

Make sure your `.env.local` file includes:

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# GitHub OAuth
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# OpenAI (REQUIRED for Phase 2!)
OPENAI_API_KEY="sk-..."
```

⚠️ **Important**: You MUST have a valid OpenAI API key for the AI features to work!

### 2. Start the Servers

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Start Prisma Studio
npm run db:studio
```

Verify both are running:

- Next.js: http://localhost:3000
- Prisma Studio: http://localhost:5555

### 3. Sign In

1. Go to http://localhost:3000
2. Click "Sign in"
3. Sign in with GitHub

## Test Flow

### Step 1: Access the Wizard

1. From the dashboard, click **"New Series"** button (top right)
2. You should see a 3-step wizard with a progress bar

### Step 2: Research Focus

**What to test**:

1. Try submitting without filling fields → Should show validation errors
2. Fill in the form:
   - **Title**: "Q4 User Onboarding Research"
   - **Research Focus**: "Why do users abandon our onboarding flow in the first 2 steps?"
   - **Optional Context**:
     - Company: "Disco - Research interview platform"
     - Product: "Our onboarding has 5 steps: account setup, profile creation, team invites, first project, and tour"
     - Assumptions: "We assume users abandon because it's too long"
     - Hypotheses: "Maybe users don't see the value early enough?"
3. Click **"Continue to Research Goals"**

**Expected Result**:

- ✅ Form validates before submission
- ✅ Can navigate to Step 2
- ✅ Progress bar updates

### Step 3: Research Goals (AI Generation)

**What to test**:

1. **Wait for AI generation** (2-5 seconds):

   - Should see loading state: "AI is generating research goals..."
   - Should generate 3-5 specific goals

2. **Review generated goals**:

   - Goals should be relevant to your research focus
   - Each goal should be specific and actionable
   - Example: "Understand user motivations for starting onboarding"

3. **Test editing**:

   - Click **"Regenerate"** → Should get new AI-generated goals
   - Click **X** on a goal → Should remove it
   - Add custom goal:
     - Type: "Identify specific friction points in step 2"
     - Click **"Add"**
     - Should appear in the list

4. Click **"Continue to Questions"**

**Expected Result**:

- ✅ AI generates relevant goals
- ✅ Can regenerate, add, and remove goals
- ✅ At least 1 goal required to continue

**Troubleshooting**:

- If you see "Failed to generate goals", check:
  - OpenAI API key is valid
  - API key has sufficient credits
  - Check browser console for errors

### Step 4: Interview Questions (AI Generation)

**What to test**:

1. **Wait for AI generation** (3-7 seconds):

   - Should see loading state: "AI is generating interview questions..."
   - Should generate 2-3 questions per goal

2. **Review generated questions**:

   - Questions should be grouped by goal
   - Questions should be open-ended (not yes/no)
   - Should start with phrases like:
     - "Tell me about..."
     - "Walk me through..."
     - "Describe a time when..."
   - Example: "Can you walk me through the last time you signed up for a new product?"

3. **Test editing**:

   - Click **"Regenerate All"** → Should get new questions
   - Click **X** on a question → Should remove it
   - Add custom question:
     - Select a goal from dropdown
     - Type: "What made you decide to continue or stop during onboarding?"
     - Click **"Add"**
     - Should appear under the selected goal

4. Click **"Create Series"**

**Expected Result**:

- ✅ AI generates open-ended questions
- ✅ Questions are properly grouped by goal
- ✅ Can regenerate, add, and remove questions
- ✅ At least 1 question required to complete

### Step 5: Series Detail Page

**What to test**:

1. **Automatic redirect**:

   - Should automatically redirect to `/series/[id]`

2. **Verify series details**:

   - Title should match what you entered
   - Research focus should be displayed
   - All goals should be listed (numbered)
   - All questions should be grouped by goal
   - Status badge should show "draft"

3. **Invite link**:

   - Should see a shareable link like: `http://localhost:3000/invite/abc123def456`
   - Click **"Copy Link"** → Should copy to clipboard
   - Click external link icon → Should open in new tab (will 404 for now, that's expected)

4. **Statistics**:
   - Sessions: Should show 0
   - Themes: Should show 0

**Expected Result**:

- ✅ All entered data is displayed correctly
- ✅ Invite link is generated and copyable
- ✅ Page loads without errors

### Step 6: Database Verification

1. Open Prisma Studio at http://localhost:5555
2. Click on **"Series"** model
3. Find your newly created series
4. Verify:
   - ✅ `title` matches
   - ✅ `researchFocus` is populated
   - ✅ `researchGoals` is a JSON array
   - ✅ `questions` is a JSON array of objects
   - ✅ `inviteLink` is a unique code
   - ✅ `status` is "draft"
   - ✅ `userId` matches your user ID

### Step 7: Dashboard Integration

1. Go back to the dashboard: http://localhost:3000/dashboard
2. Verify:
   - ✅ "Interview Series" count increased by 1
   - ✅ New series appears in "Recent Series" list
   - ✅ Clicking the series takes you to detail page

## Advanced Testing

### Test Multiple Series

1. Create 2-3 more series with different research focuses
2. Verify:
   - Each gets unique AI-generated goals
   - Each gets unique questions
   - All appear on dashboard
   - Each has a unique invite link

### Test Edge Cases

1. **Very short research focus**:

   - Try: "User retention"
   - AI should still generate goals

2. **Very long research focus**:

   - Try: A 500-word detailed description
   - Should handle gracefully

3. **No context provided**:

   - Leave all optional fields empty
   - AI should still work

4. **Remove all generated goals and add only custom ones**:

   - Should work fine

5. **Create series with only 1 question**:
   - Should allow completion

## Common Issues

### "Failed to generate goals/questions"

**Causes**:

- Invalid or missing OpenAI API key
- Insufficient API credits
- Network issues

**Fix**:

1. Check `.env.local` has `OPENAI_API_KEY`
2. Verify key at https://platform.openai.com/api-keys
3. Check terminal for error logs
4. Add goals/questions manually and continue

### TypeScript errors in IDE

**Causes**:

- TypeScript cache not updated

**Fix**:

```bash
# Restart dev server
pkill -f "next dev"
npm run dev
```

### Can't see new series on dashboard

**Causes**:

- Page cache

**Fix**:

1. Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Or navigate away and back to dashboard

## Success Criteria

After completing all tests, you should have:

- ✅ Successfully created at least 1 series
- ✅ Seen AI-generated goals and questions
- ✅ Edited/added/removed goals and questions
- ✅ Series saved to database
- ✅ Invite link generated
- ✅ Series appears on dashboard
- ✅ Series detail page displays correctly

## Next Steps

Once Phase 2 is fully tested, we'll move to **Phase 3: Interview Capture**, which includes:

- Participant landing page
- Consent form
- Microphone check
- OpenAI Realtime API integration
- Live interview transcription

---

**Phase 2 Status**: ✅ Ready for Testing!

For issues or questions, check:

- [Phase 2 Summary](./PHASE2-SUMMARY.md)
- [Complete Setup Guide](./SETUP.md)
