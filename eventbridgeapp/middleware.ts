import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicPaths = [
        '/',
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/auth/error',
        '/categories',
        '/category',
    ];

    // Public API routes
    const publicApiPaths = [
        '/api/auth',
        '/api/login',
        '/api/signup',
        '/api/public',
        '/api/uploadthing',
    ];

    // Check if the path is completely public (no auth required)
    const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));
    const isPublicApi = publicApiPaths.some(path => pathname.startsWith(path));
    const isNextInternal = pathname.startsWith('/_next/') || pathname.includes('.');

    // Always allow public paths
    if (isPublicPath || isPublicApi || isNextInternal) {
        return NextResponse.next();
    }

    // Get NextAuth session token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    console.log(`Middleware Debug: Path=${pathname}, TokenExists=${!!token}, AccountType=${token?.accountType}`);

    // If no token and trying to access protected route, redirect to login
    if (!token) {
        console.log(`Middleware: No token found, redirecting to login from ${pathname}`);
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Check for generic dashboard access
    if (pathname === '/dashboard') {
        if (token.accountType === 'VENDOR') {
            return NextResponse.redirect(new URL('/vendor', request.url));
        } else if (token.accountType === 'CUSTOMER') {
            return NextResponse.redirect(new URL('/customer/dashboard', request.url));
        } else if (token.accountType === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        // If account type is unknown or not set, maybe redirect to home or keep as is (though dashboard likely 404s)
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Check account type for customer routes
    if (pathname.startsWith('/customer')) {
        if (token.accountType !== 'CUSTOMER') {
            console.log(`Middleware: User is ${token.accountType}, not CUSTOMER. Denying access to ${pathname}`);
            // Redirect to their appropriate dashboard
            const dashboardUrl = new URL(
                token.accountType === 'VENDOR' ? '/vendor' :
                    token.accountType === 'ADMIN' ? '/admin/dashboard' :
                        '/',
                request.url
            );
            return NextResponse.redirect(dashboardUrl);
        }
    }

    // Check account type for vendor routes
    if (pathname.startsWith('/vendor')) {
        if (token.accountType !== 'VENDOR') {
            console.log(`Middleware: User is ${token.accountType}, not VENDOR. Denying access to ${pathname}`);
            const dashboardUrl = new URL(
                token.accountType === 'CUSTOMER' ? '/customer/dashboard' :
                    token.accountType === 'ADMIN' ? '/admin/dashboard' :
                        '/',
                request.url
            );
            return NextResponse.redirect(dashboardUrl);
        }
    }

    // Allow access to protected routes
    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, robots.txt, etc (public files)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
    ],
};
