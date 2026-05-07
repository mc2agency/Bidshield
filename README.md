# BidShield

AI-powered bid analysis platform for construction estimators. Helps general contractors and subcontractors analyze, score, and track bids with automated risk detection.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Backend**: Convex (real-time database + serverless functions)
- **Auth**: Clerk
- **Payments**: Stripe
- **AI**: Anthropic Claude (PDF extraction, bid analysis)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

Copy `.env.local.example` to `.env.local` and fill in all required values:

```bash
cp .env.local.example .env.local
```

Required services:
- [Convex](https://dashboard.convex.dev) — database and backend functions
- [Clerk](https://dashboard.clerk.com) — authentication
- [Stripe](https://dashboard.stripe.com) — payments
- [Anthropic](https://console.anthropic.com) — AI features
- [Brave Search](https://api.search.brave.com) — datasheet search

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Convex

Run the Convex dev server alongside Next.js:

```bash
npx convex dev
```

### Tests

```bash
npm test
```

## Deployment

The app deploys automatically to Vercel on push to `main`. Convex functions deploy separately via the Convex dashboard or CLI.

### Deployed Version

- **Commit**: `aa3a97c` — Fix bid invites query: use 'skip' pattern like other dashboard pages
- **Date**: 2026-05-07
- **Production**: https://www.bidshield.co
