# MC2 Estimating - Setup Checklist

## ✅ What's Already Done

- [x] Convex database initialized and configured
- [x] Database schema created (users, courses, progress, purchases)
- [x] Clerk authentication installed
- [x] Sign-in / Sign-up pages created
- [x] Student dashboard created
- [x] Navigation updated with auth buttons
- [x] HeyGen API integration code (ready to use)

## 🔧 What You Need to Configure

### 1. Clerk Authentication (5 minutes)

**Steps:**
1. Go to https://clerk.com and create account
2. Create new application: "MC2 Estimating"
3. Get your API keys from Dashboard → API Keys
4. Add to `.env.local`:

```bash
# Add these lines to .env.local:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# These are already correct:
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

5. Enable authentication methods in Clerk:
   - ✅ Email/Password
   - ✅ Google (recommended)

### 2. Connect Clerk to Convex (5 minutes)

**In Clerk Dashboard:**
1. Go to JWT Templates
2. Create new template: "Convex"
3. Use this issuer URL from template

**In Convex Dashboard:**
1. Go to https://dashboard.convex.dev
2. Select your project: "mc2estimating-1"
3. Go to Settings → Authentication
4. Click "Add Auth Provider" → Clerk
5. Paste the Clerk issuer URL
6. Save

This allows Convex to verify users authenticated by Clerk.

### 3. HeyGen API (Optional - for video creation)

**Only do this when ready to create videos:**

1. Go to https://www.heygen.com/api-pricing
2. Sign up for **Free API plan** (10 credits/month)
3. Get API key from dashboard
4. Update in `.env.local`:

```bash
HEYGEN_API_KEY=your_actual_key_here
```

## 🧪 Testing Your Setup

### Test 1: Authentication Flow

```bash
npm run dev
```

1. Visit http://localhost:3000
2. Click "Sign In" in navigation
3. Create an account with email or Google
4. Should redirect to Dashboard
5. See your name and "Free" membership status

### Test 2: Database Connection

In Dashboard, you should see:
- Your name displayed
- "Membership Status: Free"
- "My Courses" (empty)
- "My Products" (empty)

If you see this, Convex + Clerk are working! ✅

### Test 3: Deployment

```bash
git add .
git commit -m "Add authentication and student dashboard"
git push
```

Vercel will auto-deploy. Make sure to add environment variables in Vercel dashboard:

**Vercel → Settings → Environment Variables:**
- `NEXT_PUBLIC_CONVEX_URL` (already set)
- `CONVEX_DEPLOYMENT` (already set)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (add this)
- `CLERK_SECRET_KEY` (add this)
- `HEYGEN_API_KEY` (optional, for later)

## 📋 Next Steps After Setup

Once authentication is working:

1. **Test Purchase Flow:**
   - Set up Gumroad webhook
   - Make a test purchase
   - Verify access is granted in dashboard

2. **Create First Course Content:**
   - Write first lesson script
   - Generate intro/outro videos with HeyGen
   - Upload to Vimeo
   - Add video URLs to course pages

3. **Set up Email Marketing:**
   - Create Kit/ConvertKit account
   - Set up welcome email automation
   - Add email capture forms

4. **Launch Marketing:**
   - Write first blog post
   - Share on LinkedIn/Twitter
   - Run FB/Google ads to free learning content

## 🆘 Troubleshooting

**"Clerk is not defined" error:**
- Make sure you added Clerk env vars to `.env.local`
- Restart dev server: `npm run dev`

**Dashboard shows "Loading..." forever:**
- Check Convex connection in browser console
- Verify `NEXT_PUBLIC_CONVEX_URL` is set
- Make sure Convex deployment is running

**Can't sign in:**
- Verify Clerk keys are correct
- Check Clerk dashboard for error logs
- Make sure you enabled Email or Google auth

**Database not saving data:**
- Verify Clerk → Convex connection is configured
- Check Convex dashboard logs for errors

## 📚 Documentation

- Clerk Setup: `CLERK-SETUP.md`
- Convex Setup: `CONVEX-SETUP.md`
- HeyGen Setup: `HEYGEN-SETUP.md`
- Site Structure: `SITE-STRUCTURE.md`

## ⚡ Quick Start Commands

```bash
# Development
npm run dev

# Deploy
git push

# View Convex logs
npx convex logs

# View Convex data
npx convex dashboard
```

---

**Current Status:** 🟡 Needs Clerk API keys to be fully functional

**Time to Complete:** ~15 minutes (mostly account setup)
