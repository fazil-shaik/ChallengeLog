import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isComingSoon = process.env.NEXT_PUBLIC_COMING_SOON === 'true';
  const { pathname } = request.nextUrl;

  // Paths that should ALWAYS be accessible
  const isPublicPath = 
    pathname === '/coming-soon' ||
    pathname.startsWith('/api/waitlist') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.includes('.') || // Static files like favicon.ico, images, etc.
    pathname.startsWith('/manifest.json');

  if (isComingSoon && !isPublicPath) {
    return NextResponse.redirect(new URL('/coming-soon', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
