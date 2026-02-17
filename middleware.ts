import { clerkMiddleware } from '@clerk/nextjs/server';

// Auth disabled during rebuild phase — all routes public
// Clerk still loaded so useAuth() hooks work, but nothing is protected
export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
