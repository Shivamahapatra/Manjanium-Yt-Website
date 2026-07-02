import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/(.*)']);

export default clerkMiddleware((auth, req) => {
  // Prevent direct access via the raw Vercel URL, force users to go through the Hub
  const hostname = req.headers.get('host');
  if (hostname === 'manjanium-yt-website-game.vercel.app') {
    return NextResponse.redirect('https://manjanium-yt-website.vercel.app/simulator');
  }

  // Protect all routes (the game requires authentication)
  if (isProtectedRoute(req)) {
    auth().protect();
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
