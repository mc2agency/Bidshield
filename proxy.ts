import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Explicitly public routes that do NOT require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/blog(.*)",
  "/terms(.*)",
  "/privacy(.*)",
  "/support(.*)",
  "/updates(.*)",
  "/compare(.*)",
  "/resources(.*)",
  "/tools(.*)",
  // BidShield marketing pages — must be public (demo = no-auth-required by design)
  "/bidshield/demo(.*)",
  "/bidshield/pricing(.*)",
  "/bidshield/dashboard/templates(.*)",
  "/api/webhooks(.*)",
  "/api/gumroad(.*)",
  "/api/download(.*)",
  "/api/demo-email(.*)",
]);

// Demo mode (?demo=true) is no-auth-by-design: the dashboard client layout
// renders read-only demo data when isDemo, so skip the Clerk protect() that
// would otherwise redirect to /sign-in (and loop if instance keys are stale).
const isDemoRequest = (req: Request) =>
  new URL(req.url).searchParams.get("demo") === "true";

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req) && !isDemoRequest(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
