# 🚀 Phase 2 Quick Start

## What Was Built

**AI-Powered Series Creation Wizard** - A 3-step wizard that helps researchers create interview series with auto-generated research goals and questions.

## Quick Test (5 minutes)

### 1. Add OpenAI API Key

```bash
# Edit .env.local
OPENAI_API_KEY="sk-..."
```

### 2. Start Servers

```bash
npm run dev          # http://localhost:3000
```

### 3. Test the Wizard

1. **Sign in** → http://localhost:3000
2. **Click "New Series"** (top right of dashboard)
3. **Step 1 - Research Focus**:

   ```
   Title: "User Onboarding Research"
   Research Focus: "Why do users drop off during signup?"
   ```

   Click "Continue"

4. **Step 2 - AI Goals** ✨:

   - Wait 3 seconds
   - See 3-5 auto-generated research goals
   - Try "Regenerate" for new suggestions
   - Click "Continue"

5. **Step 3 - AI Questions** ✨:

   - Wait 5 seconds
   - See 2-3 questions per goal
   - All questions are open-ended
   - Click "Create Series"

6. **Series Detail Page**:
   - See your complete series
   - Copy the invite link
   - View all goals and questions

## Key Features to Test

### ✨ AI Generation

- **Goals**: GPT-4o analyzes your research focus
- **Questions**: Open-ended, storytelling-focused
- **Regenerate**: Get new AI suggestions

### ✏️ Manual Editing

- Add custom goals/questions
- Remove AI suggestions
- Mix AI + manual content

### 💾 Database Storage

- Series saved to PostgreSQL
- Unique invite link generated
- Appears on dashboard

## Expected Experience

```
Dashboard → New Series Button
    ↓
Step 1: Research Focus Form
    ↓
Step 2: AI Generates Goals (3-5 sec) ✨
    ↓
Step 3: AI Generates Questions (5-7 sec) ✨
    ↓
Create Series → Database Save
    ↓
Series Detail Page (with invite link)
```

## Files to Explore

### Main Wizard

- `src/app/series/new/page.tsx` - Wizard container

### Steps

- `src/app/series/new/steps/research-focus.tsx` - Step 1
- `src/app/series/new/steps/research-goals.tsx` - Step 2
- `src/app/series/new/steps/questions.tsx` - Step 3

### API Endpoints

- `src/app/api/series/generate-goals/route.ts` - AI goals
- `src/app/api/series/generate-questions/route.ts` - AI questions
- `src/app/api/series/create/route.ts` - Save to DB

### Detail Page

- `src/app/series/[id]/page.tsx` - Series view

## Troubleshooting

**"Failed to generate goals"**

```bash
# Check OpenAI key in .env.local
echo $OPENAI_API_KEY

# Restart server
npm run dev
```

**TypeScript errors**

```bash
# Clear cache and restart
rm -rf .next
npm run dev
```

## Next Phase: Interview Capture

Phase 3 will build:

- Participant landing page (`/invite/[code]`)
- Consent form
- Microphone check
- **OpenAI Realtime API** for live interviews
- Session transcription
- Audio storage

---

**🎉 Phase 2 Complete!** - Ready to test the Series Creation Wizard.

📖 **Detailed Testing Guide**: [PHASE2-TESTING.md](./PHASE2-TESTING.md)
