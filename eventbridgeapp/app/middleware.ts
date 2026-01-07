import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/api/login',
    '/api/signup',
    '/api/uploadthing', // If you're using uploadthing
  ];

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path || 
    pathname.startsWith(`${path}/`) ||
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/api/_next/') || 
    pathname.includes('.')
  );

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get auth token from cookies
  const token = request.cookies.get('auth-token')?.value;
  const sessionToken = request.cookies.get('session')?.value;

  // If no token and trying to access protected route, redirect to login
  if (!token && !sessionToken) {
    const loginUrl = new URL('/login', request.url);
    
    // Add redirect parameter if not already on login/signup
    if (!pathname.includes('/login') && !pathname.includes('/signup')) {
      loginUrl.searchParams.set('redirect', pathname);
    }
    
    return NextResponse.redirect(loginUrl);
  }

  // Allow access to protected routes
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};