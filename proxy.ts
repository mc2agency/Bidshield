import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that require authentication
// Note: /bidshield/dashboard supports ?demo=true so we protect it here
// but the layout also checks isDemo to allow unauthenticated demo access.
const isProtectedRoute = createRouteMatcher([
  "/bidshield/dashboard(.*)",
  "/bidshield/export(.*)",
  "/bidshield/projects(.*)",
  "/bidshield/checklist(.*)",
  "/bidshield/analytics(.*)",
  "/dashboard(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
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
