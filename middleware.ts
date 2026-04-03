import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that are always public (marketing, auth, API webhooks, demo, pricing)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/bidshield",
  "/bidshield/demo(.*)",
  "/bidshield/pricing(.*)",
  "/blog(.*)",
  "/resources(.*)",
  "/tools(.*)",
  "/products(.*)",
  "/compare(.*)",
  "/contact(.*)",
  "/support(.*)",
  "/about(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/updates(.*)",
  "/quiz(.*)",
  "/pricing(.*)",
  "/membership(.*)",
  "/checkout/success(.*)",
  "/sitemap.xml",
  "/robots.txt",
]);

export default clerkMiddleware(async (auth, req) => {
  // All /bidshield/* routes (except public ones above) require authentication
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
