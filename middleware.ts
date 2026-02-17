import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/bidshield/dashboard(.*)',
]);

// Allow demo mode to bypass auth for BidShield
function isDemoRequest(req: Request): boolean {
  const url = new URL(req.url);
  return url.searchParams.get('demo') === 'true';
}

// Define public routes that don't need authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/products(.*)',
  '/pricing',
  '/updates',
  '/support',
  '/blog(.*)',
  '/about',
  '/contact',
  '/membership',
  '/privacy',
  '/terms',
  '/quiz',
  '/bidshield',
  '/bidshield/pricing',
  '/resources(.*)',
  '/tools(.*)',
  '/api/webhooks(.*)',
  '/api/bidshield/webhook(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect dashboard routes - require authentication
  // Allow demo mode to bypass for BidShield preview
  if (isProtectedRoute(req) && !isDemoRequest(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
