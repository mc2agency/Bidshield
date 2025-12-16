# HeyGen Setup Guide for MC2 Estimating

## 🎯 Quick Start (10 Minutes)

### Step 1: Get Your API Key

1. Go to https://app.heygen.com/settings/api
2. Click "Create API Key"
3. Copy the key
4. Add to `.env.local`:
   ```bash
   HEYGEN_API_KEY=your_key_here
   ```

### Step 2: Choose Your Avatar

**Option A: Use Stock Avatar (Fastest)**
1. Go to https://app.heygen.com/avatars
2. Browse 100+ professional avatars
3. Choose one that fits "professional estimator/instructor"
4. Copy the Avatar ID
5. Note: Most popular for business courses:
   - Professional male in business casual
   - Professional female in business attire
   - Friendly, approachable look

**Option B: Create Your Digital Clone (Most Personal)**
1. Go to https://app.heygen.com/instant-avatar
2. Record yourself for 2-5 minutes reading the provided script
3. Upload video
4. Wait 10-30 minutes for processing
5. Use your avatar ID in API calls

**Recommendation for MC2:** Start with stock avatar, test reception, then create your clone if students respond well.

### Step 3: Test the API

Run this command to test:
```bash
npm run dev
# Visit http://localhost:3000/admin/test-heygen
```

---

## 📝 Creating Your First Video

### Example 1: Course Introduction

**Script:**
```
Welcome to MC2 Estimating Academy. I'm excited to teach you
professional roofing estimation techniques that typically take
5 years to learn on the job.

In this course, you'll master:
- Reading construction plans like an expert
- Using Bluebeam for digital takeoffs
- Calculating materials and labor accurately
- Creating winning proposals

By the end, you'll estimate faster and more accurately than
estimators with years of experience. Let's get started.
```

**Using the API:**
```typescript
import { generateVideo, waitForVideo } from '@/lib/heygen-api';

const video = await generateVideo({
  script: "Welcome to MC2 Estimating Academy...",
  title: "Course Introduction",
  avatarId: "your_avatar_id", // From HeyGen dashboard
});

const result = await waitForVideo(video.video_id);
console.log('Video URL:', result.video_url);
```

---

## 🎬 Video Production Workflow

### For Each Course Lesson:

**1. Plan Content (15 min)**
- Outline key points
- Write detailed script
- Keep it conversational

**2. Generate Avatar Intro (5 min)**
```typescript
const intro = await generateVideo({
  script: `In this lesson, we're covering ${lessonTopic}.
  By the end, you'll be able to ${learningObjective}`,
  title: `${courseName} - Lesson ${lessonNumber}`,
});
```

**3. Record Screen Demo (30 min)**
- Use Loom or OBS
- Show software in action
- No audio needed (will add AI voice later)

**4. Generate Outro (5 min)**
```typescript
const outro = await generateVideo({
  script: `Great work! You now know ${whatTheyLearned}.
  In the next lesson, we'll cover ${nextTopic}`,
  title: `${courseName} - Lesson ${lessonNumber} Outro`,
});
```

**5. Combine Videos (15 min)**
- Use Descript or any video editor
- Intro (avatar) → Main content (screen) → Outro (avatar)
- Export as MP4

**Total Time per Lesson:** ~1 hour

---

## 💰 HeyGen API Pricing (Correct as of 2025)

**IMPORTANT:** API access requires a separate API subscription (not the regular Creator plan)

**API Plans:**
- **Free**: 10 API credits/month (perfect for testing!)
- **Pro**: $99/mo for 100 credits ($0.99 per credit)
- **Scale**: $330/mo for 660 credits ($0.50 per credit)
- **Enterprise**: Custom pricing with SLAs and priority support

**Credit Usage:**
- 1 credit = 1 minute of video
- Example breakdown:
  - 30-second intro = 0.5 credits
  - 30-second outro = 0.5 credits
  - **Per lesson = 1 credit**
  - **Free plan = 10 test videos per month**
  - **Pro plan = 100 minutes per month**

**Recommendation for MC2:**
1. Start with **Free API plan** (10 credits) to test and validate
2. If students respond well, upgrade to **Pro** ($99/mo for 100 credits)
3. Credits expire after 30 days

**Tip:** Keep avatar segments short (30-60 seconds), use screen recording for longer content

---

## 🎓 Your First Course: Bluebeam Mastery

### Suggested Video Structure:

**Module 1: Introduction**
- Lesson 1.1: Course Overview (2 min avatar)
- Lesson 1.2: Bluebeam Interface Tour (8 min screen)
- Lesson 1.3: Basic Navigation (6 min screen)

**Module 2: Calibration**
- Lesson 2.1: Why Calibration Matters (1 min avatar intro + 7 min screen)
- Lesson 2.2: Step-by-Step Calibration (10 min screen)
- Lesson 2.3: Troubleshooting (5 min screen)

**Continue this pattern for 8 modules...**

**Total Avatar Time Needed:**
- 40 lessons × 1 min intro/outro = 40 minutes
- Fits in **Pro Plan** ($89/mo)

---

## 🔧 Troubleshooting

### Common Issues:

**1. API Key Not Working**
- Make sure you're on Creator plan or higher (Free trial doesn't include API)
- Check key is in `.env.local` (not `.env`)
- Restart dev server after adding key

**2. Video Generation Fails**
- Check script length (max 10,000 characters)
- Verify avatar ID is correct
- Check you have credits remaining

**3. Video Takes Long Time**
- Normal: 2-5 minutes for 1-minute video
- Peak times may be slower
- Use webhook instead of polling if creating many videos

### Getting Help:

- HeyGen Support: https://help.heygen.com
- API Docs: https://docs.heygen.com
- Community: https://discord.gg/heygen

---

## 📊 Recommended Workflow for MC2

### Phase 1: Create Sample Lesson (This Week)

1. **Choose Avatar:** Pick stock avatar from HeyGen
2. **Write Script:** One complete lesson (intro + outro)
3. **Generate Videos:** Test API with first lesson
4. **Record Screen:** Bluebeam demo for same lesson
5. **Combine:** Create first complete lesson
6. **Upload:** Add to Vimeo
7. **Test:** Show to 5-10 beta testers

**Goal:** Validate students like AI avatar approach

### Phase 2: Batch Production (Next 2 Weeks)

1. **Write All Scripts:** 10-20 lesson scripts
2. **Batch Generate:** Run API for all intros/outros
3. **Batch Record:** Record all screen demos in one session
4. **Batch Edit:** Combine all videos
5. **Upload:** Bulk upload to Vimeo

**Goal:** Complete first course module (10 lessons)

### Phase 3: Launch & Iterate (Week 4)

1. **Publish Course:** Make available for purchase
2. **Collect Feedback:** Student surveys
3. **Iterate:** Adjust based on response
4. **Scale:** Apply learnings to remaining modules

---

## 🎯 Success Metrics

Track these to optimize:
- **Video completion rate** (how many finish videos)
- **Student feedback** on avatar quality
- **Conversion rate** (free → paid)
- **Time saved** vs traditional filming

**Baseline Goals:**
- Completion rate: >70%
- Avatar approval rating: >4/5 stars
- Production time: <1 hour per lesson
- Cost per video: <$5 (API + editing time)

---

## 💡 Pro Tips

1. **Keep Avatar Segments Short**
   - Use for intros/outros (30-60 sec)
   - Use screen recording for teaching (5-10 min)
   - More engaging, less uncanny valley

2. **Brand Your Avatar**
   - Choose consistent outfit
   - Same avatar across all courses
   - Give them a name (builds familiarity)

3. **Script Naturally**
   - Write like you speak
   - Use contractions (you'll vs you will)
   - Include pauses [pause]
   - Emphasize key words in CAPS

4. **Test Before Batch**
   - Create 1-2 sample lessons first
   - Show to beta testers
   - Refine based on feedback
   - Then batch produce

5. **Combine AI + Human**
   - Avatar for standard content
   - Consider real video for key moments
   - Builds trust and authenticity

---

## 📞 Next Steps

**Today:**
- [ ] Sign up for HeyGen Creator ($24/mo)
- [ ] Get API key
- [ ] Add to `.env.local`
- [ ] Choose your avatar

**This Week:**
- [ ] Write script for first lesson
- [ ] Generate test video
- [ ] Record screen demo
- [ ] Combine into complete lesson
- [ ] Upload to Vimeo (sign up if needed)

**Next Week:**
- [ ] Show to 5-10 beta testers
- [ ] Collect feedback
- [ ] Refine approach
- [ ] Start batch production

**Questions?**
Let me know and I can help with:
- Script writing templates
- Video editing workflows
- API integration issues
- Production scheduling
