# Phase 3 Testing Guide

## 🎯 Quick Test Checklist

- [ ] Landing page loads with series info
- [ ] Microphone check visualizes audio levels
- [ ] Consent form creates session
- [ ] Interview connects to OpenAI Realtime API
- [ ] User speech is transcribed in real-time
- [ ] AI responses appear in transcript
- [ ] Mute button works
- [ ] End interview navigates to completion page

---

## 📋 Detailed Test Steps

### 1. Prepare an Active Series

**1.1 Create Series**

```
1. Go to http://localhost:3000/dashboard
2. Click "Create Series"
3. Fill in research focus (e.g., "User onboarding experience")
4. Generate goals and questions
5. Complete wizard
```

**1.2 Activate Series**

```
1. Go to http://localhost:5555 (Prisma Studio)
2. Click "Series" table
3. Find your newly created series
4. Change status from "DRAFT" to "ACTIVE"
5. Save
```

**1.3 Get Invite Link**

```
1. Go back to series detail page in main app
2. Copy the invite link (looks like: http://localhost:3000/interview/abc123def456)
```

---

### 2. Test Landing Page

**URL:** `http://localhost:3000/interview/[inviteCode]`

**✅ Expected:**

- Series title and research focus displayed
- Estimated time shown (if set)
- Consent form with checkbox
- Microphone check section

**🧪 Test Microphone:**

1. Click "Test Microphone"
2. Browser asks for mic permission - grant it
3. Speak normally
4. Green bar should move when you talk
5. Should see "Working" indicator when audio level > 10

**🧪 Test Consent:**

1. Try clicking "Continue" without checking checkbox
   - Should show error: "Please read and agree..."
2. Check the consent checkbox
3. Click "Continue to Mic Check"
4. Should navigate to `/interview/[inviteCode]/session`

---

### 3. Test Interview Session

**URL:** `http://localhost:3000/interview/[inviteCode]/session`

**Phase 1: Connection**

- Should see "Connecting to AI interviewer..."
- Loading spinner should appear
- Check browser console for logs:
  - "✅ Connected to OpenAI Realtime API"
  - Realtime events logging

**Phase 2: Interview Start**

- AI should introduce itself
- First message should appear in transcript
- AI speaking indicator should light up (blue)

**Phase 3: Conversation**

1. **User Speaks:**

   - Talk naturally about the research topic
   - Your speech should appear in transcript (blue bubble, right side)
   - Should see timestamp

2. **AI Responds:**

   - AI response appears in transcript (gray bubble, left side)
   - "Listening..." indicator shows when waiting for you
   - "AI is speaking..." indicator when AI talks

3. **Test Mute:**
   - Click microphone button to mute
   - Icon should change to MicOff
   - Your speech shouldn't be captured while muted
   - Unmute and continue

**Phase 4: End Interview**

1. Click "End Interview" button (top right)
2. Should navigate to completion page
3. Should see "Thank You!" message

---

### 4. Verify Database State

**In Prisma Studio (http://localhost:5555):**

**Check Session Record:**

```
Sessions table → Find your session
- participantId: Should be "participant_[randomhex]"
- status: Should be "IN_PROGRESS"
- consentGivenAt: Should have timestamp
- consentVersion: Should match series consent version
- startedAt: Should have timestamp (when interview started)
- language: Should be "en"
```

**Check Series:**

```
Series table → Your series
- status: Should still be "ACTIVE"
- _count.sessions: Should increment by 1
```

---

## 🐛 Common Issues & Solutions

### Issue: "Interview Series Not Available"

**Symptom:** Landing page shows "in draft mode" message

**Solutions:**

1. Series status must be `ACTIVE`, not `DRAFT`
2. Update in Prisma Studio: `Series` → find record → change `status`
3. If you just created the series, it defaults to `DRAFT`

---

### Issue: Microphone doesn't work

**Symptom:** Green bar doesn't move when speaking

**Solutions:**

1. Grant microphone permission in browser
2. Check browser mic settings (gear icon in address bar)
3. Test mic in system settings first
4. Try a different browser (Chrome/Edge recommended)

---

### Issue: "Failed to start interview session"

**Symptom:** Error on session page after consent

**Solutions:**

1. Check `OPENAI_API_KEY` in `.env.local`
2. Verify OpenAI account has Realtime API access (beta)
3. Check browser console for detailed error
4. Restart Next.js dev server
5. Clear localStorage and try again

---

### Issue: WebSocket connection fails

**Symptom:** Stuck on "Connecting..." forever

**Console Errors to Check:**

```javascript
// Browser Console (F12)
WebSocket error: ...
Realtime API error: ...
```

**Solutions:**

1. Check internet connection
2. Verify OpenAI API key is valid
3. Check if firewall blocks WebSocket to `api.openai.com`
4. Try disabling VPN if using one
5. Check OpenAI service status

---

### Issue: No transcription appearing

**Symptom:** Conversation happening but transcript empty

**Solutions:**

1. Check browser console for realtime events:
   - Should see: `Realtime event: conversation.item.created`
   - Should see: `Realtime event: input_audio_buffer.speech_stopped`
2. Verify audio is streaming (check mic mute status)
3. Speak louder/clearer for VAD to detect speech
4. Check OpenAI Realtime API console for errors

---

### Issue: AI not responding

**Symptom:** Your speech is transcribed but no AI reply

**Possible Causes:**

1. OpenAI Realtime API rate limits
2. Instructions too complex causing model confusion
3. WebSocket dropped mid-conversation

**Debug Steps:**

1. Check browser console for `response.done` events
2. Look for OpenAI error events
3. Check session instructions in API endpoint
4. Verify OpenAI account credits/quota

---

## 📊 Expected Console Output

### Successful Connection Flow

```javascript
// Client Console (Browser)
✅ Connected to OpenAI Realtime API
Realtime event: session.created
Realtime event: session.updated
User started speaking
User stopped speaking
Realtime event: conversation.item.created
Realtime event: response.audio.delta
Realtime event: response.audio.done
Response complete
```

### Server Console (Terminal)

```bash
✅ Session created: cmgi1h60p000bd6gtriuiqc8p
  - Participant ID: participant_a1b2c3d4e5f6g7h8
  - Consent version: 1
✅ Realtime session created for: cmgi1h60p000bd6gtriuiqc8p
  - Client secret: cs_abc123xyz...
```

---

## 🎨 Visual Testing

### Landing Page

- [ ] Modern gradient background (blue to indigo)
- [ ] Clean white cards with rounded corners
- [ ] Clear typography and spacing
- [ ] Responsive layout (test on mobile)
- [ ] Icons render properly (Clock, Gift, Users, Sparkles)

### Interview Session

- [ ] Full-screen layout with header
- [ ] AI status indicator centered and prominent
- [ ] Transcript scrollable with max-height
- [ ] Messages styled correctly (user: blue right, AI: gray left)
- [ ] Timestamps visible and formatted
- [ ] Mic button centered at bottom
- [ ] "End Interview" button visible in header

### Completion Page

- [ ] Green checkmark icon centered
- [ ] Thank you message clear and friendly
- [ ] Indigo highlight box with sparkle icon
- [ ] Clean, centered layout
- [ ] Professional closing text

---

## ⚡ Performance Testing

### Latency Checks

- **Mic → Transcript:** Should appear within 0.5-2 seconds after you stop speaking
- **AI Response Time:** Should start speaking within 1-3 seconds
- **Transcript Update:** Should appear smoothly, not laggy
- **WebSocket:** Should maintain stable connection throughout

### Audio Quality

- **Clarity:** Transcription should be accurate (90%+ for clear speech)
- **No Dropouts:** Audio shouldn't cut out mid-sentence
- **No Echo:** Shouldn't hear yourself echoing
- **Background Noise:** Should filter out keyboard typing, fan noise

---

## 🔍 Browser DevTools Tips

### Console Logging

```javascript
// Filter console by:
"Realtime event"; // See all OpenAI events
"✅"; // See success messages
"error"; // See errors only
```

### Network Tab

```
Filter: WS (WebSocket)
Should see: wss://api.openai.com/v1/realtime
Status: 101 Switching Protocols (successful)
```

### Application Tab

```
Local Storage → http://localhost:3000
Should have: disco_session_id = cmgi1h60p000bd6gtriuiqc8p
```

---

## ✅ Success Criteria

**Phase 3 is working correctly if:**

1. ✅ Participant can access interview via invite link
2. ✅ Microphone check visualizes audio levels
3. ✅ Consent form creates session in database
4. ✅ Interview connects to OpenAI Realtime API
5. ✅ User speech is captured and transcribed
6. ✅ AI responds intelligently based on research questions
7. ✅ Transcript updates in real-time for both parties
8. ✅ Interview can be ended gracefully
9. ✅ Completion page displays after ending
10. ✅ Session status updates correctly (SCHEDULED → IN_PROGRESS)

**Optional (nice-to-have):**

- AI audio plays through speakers (currently transcript-only)
- Reconnect if WebSocket drops (currently fails)
- Turn data saved to database (Task 3.4)
- Audio uploaded to storage (Task 3.5)

---

## 📞 Next Steps After Testing

### If Tests Pass ✅

- Proceed to Task 3.4: Turn recording and PII redaction
- Proceed to Task 3.5: Audio storage and completion
- Polish UX based on feedback

### If Tests Fail ❌

- Report specific issues with:
  1. Browser console errors
  2. Network tab WebSocket status
  3. Expected vs actual behavior
  4. Steps to reproduce

---

## 🚀 Ready to Test!

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start Prisma Studio
npm run db:studio

# Then follow steps above!
```

Good luck testing! 🎉
