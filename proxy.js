import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = [
    '/auth/login',
    '/auth/register',
    '/api/auth',
    '/api/users',
];

export async function proxy(req) {
    const { pathname } = req.nextUrl;

    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/icon') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    if (pathname.startsWith('/admin') && token.role !== 'admin') {
        return NextResponse.redirect(new URL('/knives', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};