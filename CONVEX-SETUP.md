# Convex Setup for MC2 Estimating

## Why Convex?

Convex is perfect for your course platform because it provides:
- **Real-time database** - Student progress updates instantly
- **Built-in authentication** - Works with Google, GitHub, email/password
- **Type-safe APIs** - Full TypeScript support
- **Serverless functions** - No backend management needed
- **Free tier** - Generous limits for getting started

## Setup Steps

### 1. Create Convex Account

1. Go to https://convex.dev
2. Sign up (free)
3. Create a new project: "MC2 Estimating"

### 2. Initialize Convex in Your Project

```bash
npx convex dev
```

This will:
- Create a `convex/` folder for your backend code
- Add Convex config to your project
- Generate API keys and add to `.env.local`

### 3. Database Schema

Convex will create these tables for you:

**Users Table:**
```typescript
// convex/schema.ts
users: defineTable({
  email: v.string(),
  name: v.string(),
  membershipLevel: v.union(
    v.literal('free'),
    v.literal('course'),
    v.literal('pro')
  ),
  purchasedCourses: v.array(v.string()),
  purchasedProducts: v.array(v.string()),
  createdAt: v.number(),
}).index('by_email', ['email']),
```

**Course Progress Table:**
```typescript
courseProgress: defineTable({
  userId: v.id('users'),
  courseId: v.string(),
  lessonId: v.string(),
  completed: v.boolean(),
  completedAt: v.optional(v.number()),
  videoProgress: v.optional(v.number()), // seconds watched
}).index('by_user_course', ['userId', 'courseId']),
```

**Purchases Table:**
```typescript
purchases: defineTable({
  userId: v.id('users'),
  productId: v.string(),
  productType: v.union(
    v.literal('course'),
    v.literal('product'),
    v.literal('membership')
  ),
  amount: v.number(),
  gumroadOrderId: v.string(),
  purchasedAt: v.number(),
}).index('by_user', ['userId'])
  .index('by_gumroad_order', ['gumroadOrderId']),
```

### 4. Authentication Setup

Convex works great with Clerk (which we'll use):

```bash
npm install @clerk/nextjs
```

Then connect Clerk to Convex following: https://docs.convex.dev/auth/clerk

### 5. Key Features You'll Build

**Real-time Progress Tracking:**
```typescript
// Student watches a lesson, progress updates instantly
const updateProgress = mutation({
  args: {
    courseId: v.string(),
    lessonId: v.string(),
    videoProgress: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    // Update progress in real-time
  },
});
```

**Course Access Control:**
```typescript
// Check if user has access to a course
const hasAccess = query({
  args: { courseId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    return user.purchasedCourses.includes(args.courseId) ||
           user.membershipLevel === 'pro';
  },
});
```

**Gumroad Webhook Integration:**
```typescript
// When someone buys on Gumroad, grant access
const handlePurchase = mutation({
  args: {
    email: v.string(),
    productId: v.string(),
    orderId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find or create user
    // Add course/product to their account
    // Send welcome email
  },
});
```

## Next Steps

1. Run `npx convex dev` to initialize
2. I'll help you set up the schema
3. Connect Clerk for authentication
4. Build the student dashboard
5. Integrate Gumroad webhooks

## Pricing

**Free Tier (Perfect for starting):**
- 1 million function calls/month
- 1 GB database storage
- Unlimited projects

**Paid (When you scale):**
- $25/mo for more resources

You'll likely stay on free tier for the first 100-500 students.

## Resources

- Docs: https://docs.convex.dev
- Auth Guide: https://docs.convex.dev/auth
- Next.js Guide: https://docs.convex.dev/quickstart/nextjs
