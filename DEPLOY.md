# CI/CD Setup — BidShield / MC2 Estimating

## How It Works

Every `git push` to `main`:
1. TypeScript check runs (blocks deploy if types break)
2. Convex backend deploys first
3. Vercel production deploys second
4. Daily health check pings all critical URLs

Pull requests get a preview URL automatically.

---

## Step 1 — Add GitHub Secrets

Go to: **GitHub → mc2agency/mc2estimating → Settings → Secrets and variables → Actions**

Add these secrets:

### Vercel Secrets

| Secret | Where to find it |
|--------|-----------------|
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Run `vercel link` locally, then check `.vercel/project.json` → `"orgId"` |
| `VERCEL_PROJECT_ID` | Same file → `"projectId"` |

### Convex Secret

| Secret | Where to find it |
|--------|-----------------|
| `CONVEX_DEPLOY_KEY` | dashboard.convex.dev → your project → Settings → Deploy Key |

---

## Step 2 — Add Env Vars to Vercel

Go to: **vercel.com → mc2estimating → Settings → Environment Variables**

Add all variables from `.env.local.example`:

```
NEXT_PUBLIC_CONVEX_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_JWT_ISSUER_DOMAIN
CLERK_WEBHOOK_SECRET
STRIPE_SECRET_KEY
STRIPE_PRICE_PRO_MONTHLY
STRIPE_PRICE_PRO_ANNUAL
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_URL
NEXT_PUBLIC_APP_URL
```

Set all to **Production** + **Preview** environments.

---

## Step 3 — Configure Clerk JWT Template

**Critical** — this is what connects Clerk auth tokens to Convex.

1. Go to **clerk.com → Dashboard → JWT Templates**
2. Click **New template**
3. Name it exactly: `convex` (case-sensitive)
4. Copy the **Issuer URL** shown
5. Add that URL as `CLERK_JWT_ISSUER_DOMAIN` in both Vercel env vars and `.env.local`

---

## Step 4 — Configure Stripe Products

1. Go to **dashboard.stripe.com → Products → Add product**
2. Name: `BidShield Pro`
3. Add two prices:
   - **Monthly**: $149.00 / month → copy `price_...` ID → `STRIPE_PRICE_PRO_MONTHLY`
   - **Annual**: $1,490.00 / year → copy `price_...` ID → `STRIPE_PRICE_PRO_ANNUAL`

### Stripe Webhook

1. **dashboard.stripe.com → Webhooks → Add endpoint**
2. URL: `https://mc2estimating.com/api/bidshield/webhook`
3. Enable these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## Step 5 — First Deploy

```bash
# Push the committed fixes to trigger the pipeline
git push origin main
```

Watch it run at: **github.com/mc2agency/mc2estimating/actions**

---

## Pipeline Flow

```
git push main
     │
     ▼
┌─────────────┐
│  TypeScript  │  Fails? → Deploy blocked, you get email
│    Check     │
└──────┬──────┘
       │ passes
       ▼
┌─────────────┐     ┌─────────────┐
│   Convex    │     │   Preview   │  (only on PRs)
│   Deploy    │     │   Deploy    │
└──────┬──────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│   Vercel    │
│  Production │
│   Deploy    │
└─────────────┘
       │
       ▼ (next morning)
┌─────────────┐
│   Health    │
│    Check    │  Fails? → GitHub sends you an email
└─────────────┘
```

---

## Local Development

```bash
# Install deps
npm install

# Copy env file
cp .env.local.example .env.local
# Fill in your values

# Start Convex dev server (separate terminal)
npx convex dev

# Start Next.js dev server
npm run dev
```

---

## Troubleshooting

**Auth not working after deploy:**
- Verify `CLERK_JWT_ISSUER_DOMAIN` matches exactly what Clerk shows in JWT Templates
- Verify the JWT template is named exactly `convex`

**Stripe checkout redirects to error:**
- Check `STRIPE_PRICE_PRO_MONTHLY` and `STRIPE_PRICE_PRO_ANNUAL` are set in Vercel env vars
- Make sure prices are active (not archived) in Stripe dashboard

**Convex mutations failing:**
- Check `NEXT_PUBLIC_CONVEX_URL` ends in `.convex.cloud` (no trailing slash)
- Verify `CONVEX_DEPLOY_KEY` in GitHub secrets is the production deploy key
