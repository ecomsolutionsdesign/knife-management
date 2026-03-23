// middleware.js  (place this in your project ROOT, next to package.json)
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

// Routes that do NOT require authentication
const PUBLIC_PATHS = [
    '/auth/login',
    '/auth/register',
    '/api/auth',        // NextAuth internal routes
];

export async function middleware(req) {
    const { pathname } = req.nextUrl;

    // Allow public paths through
    const isPublic = PUBLIC_PATHS.some(path => pathname.startsWith(path));
    if (isPublic) return NextResponse.next();

    // Allow Next.js internals (_next/static, _next/image, favicon, icons)
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/icon') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    // Check for valid session token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        // Redirect to login, preserving the intended destination
        const loginUrl = new URL('/auth/login', req.url);
        loginUrl.searchParams.set('callbackUrl', req.url);
        return NextResponse.redirect(loginUrl);
    }

    // Admin-only routes
    if (pathname.startsWith('/admin') && token.role !== 'admin') {
        return NextResponse.redirect(new URL('/knives', req.url));
    }

    return NextResponse.next();
}

// Apply middleware to all routes except static files
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};