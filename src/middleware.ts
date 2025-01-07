import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/server/supabase-client';

export async function middleware(request: NextRequest) {
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
        .split('; ')
        .find(row => row.startsWith('sb-access-token='))
        ?.split('=')[1];

    console.log('Middleware - Token extraído:', token);

    let isLoggedIn = false;

    if (token) {
        const { data, error } = await supabase.auth.getUser(token);
        console.log('Middleware - Dados do usuário:', data);
        console.log('Middleware - Erro ao obter usuário:', error);
        if (data.user) {
            isLoggedIn = true;
        }
    }

    const { pathname } = request.nextUrl;

    console.log(`Middleware - Verificando pathname: ${pathname}`);
    console.log(`Middleware - Usuário está logado: ${isLoggedIn}`);

    if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/rooms')) {
        if (!isLoggedIn) {
            console.log('Middleware - Redirecionando para /login');
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
        if (isLoggedIn) {
            console.log('Middleware - Redirecionando para /dashboard');
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register', '/users/:path*', '/api/rooms/:path*', '/rooms/:path*'],
};
