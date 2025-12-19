import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

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
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect dashboard routes - require authentication
  if (isProtectedRoute(req)) {
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
