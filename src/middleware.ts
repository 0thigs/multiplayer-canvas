import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/server/supabase-client';

export async function middleware(request: NextRequest) {
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
        .split('; ')
        .find(row => row.startsWith('sb-access-token='))
        ?.split('=')[1];

    let isLoggedIn = false;

    if (token) {
        const { data, error } = await supabase.auth.getUser(token);
        if (data.user) {
            isLoggedIn = true;
        }
    }

    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/rooms')) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register', '/users/:path*', '/api/rooms/:path*', '/rooms/:path*'],
};
