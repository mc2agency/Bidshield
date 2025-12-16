# Clerk Authentication Setup

## Why Clerk?

Clerk provides hassle-free authentication for your course platform:
- Social logins (Google, GitHub, etc.)
- Email/password authentication
- Magic links
- User management dashboard
- Works seamlessly with Convex
- Free tier: 10,000 monthly active users

## Setup Steps

### 1. Create Clerk Account

1. Go to https://clerk.com
2. Sign up (free)
3. Create a new application: "MC2 Estimating"
4. Choose authentication methods:
   - ✅ Email/Password
   - ✅ Google (recommended)
   - ✅ GitHub (optional)

### 2. Get Your API Keys

From Clerk Dashboard:
1. Go to API Keys
2. Copy your keys
3. Add to `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs (auto-configured)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 3. Connect Clerk to Convex

Follow this guide: https://docs.convex.dev/auth/clerk

In Clerk Dashboard:
1. Go to JWT Templates
2. Create new template: "convex"
3. Copy the issuer URL
4. Add to Convex dashboard

This allows Convex to verify users authenticated by Clerk.

### 4. Test Authentication

Visit your site:
- Click "Sign In" - should see Clerk sign-in page
- Sign up with email or Google
- After sign-in, redirects to dashboard

## User Flow

**New User:**
1. Visits site → Browses free content
2. Tries to access paid course → Redirected to sign-in
3. Signs up with Google/Email
4. Purchases course on Gumroad
5. Gumroad webhook → Convex grants access
6. User can now access course

**Returning User:**
1. Clicks "Sign In"
2. Authenticates with Clerk
3. Clerk → Convex syncs user data
4. Dashboard shows their purchased courses

## Pricing

**Free Tier:**
- 10,000 monthly active users
- All authentication methods
- User management dashboard
- Perfect for launching

**Paid (When you scale):**
- $25/mo for more users
- Advanced features

You'll stay on free tier for your first 1000+ students easily.

## Next Steps

After setting up Clerk:
1. I'll create sign-in/sign-up pages
2. Build the student dashboard
3. Add course access control
4. Integrate with Gumroad webhooks
