// proxy.js  (project ROOT, next to package.json)
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = [
    '/auth/login',
    '/auth/register',
    '/api/auth',          // covers /api/auth/session, /api/auth/callback/credentials, etc.
    '/api/users',         // needed for first-time registration (server checks auth internally)
];

export async function proxy(req) {
    const { pathname } = req.nextUrl;

    // Always allow public paths (auth pages + ALL NextAuth API routes)
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Always allow Next.js internals and static assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/icon') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    // Verify session token
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: process.env.NODE_ENV === 'production'
            ? '__Secure-next-auth.session-token'
            : 'next-auth.session-token',
    });

    if (!token) {
        // For API routes return 401 (don't redirect API calls)
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        // For pages redirect to login
        const loginUrl = new URL('/auth/login', req.url);
        loginUrl.searchParams.set('callbackUrl', req.url);
        return NextResponse.redirect(loginUrl);
    }

    // Admin-only pages
    if (pathname.startsWith('/admin') && token.role !== 'admin') {
        return NextResponse.redirect(new URL('/knives', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};