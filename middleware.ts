import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Define Public Routes
const isPublicRoute = createRouteMatcher([
  '/', 
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/:schoolSlug',           // Public School Landing Page
  '/api/webhooks(.*)'       // Critical for syncing data
]);

// 2. Export Middleware
export default clerkMiddleware(async (auth, req) => {
  // 3. Protect routes that are NOT public
  if (!isPublicRoute(req)) {
    // FIX: Use 'await auth.protect()' instead of 'auth().protect()'
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};