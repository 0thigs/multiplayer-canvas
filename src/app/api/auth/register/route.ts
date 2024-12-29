import { NextResponse } from 'next/server';
import AuthService from '@/server/user/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    const authService = new AuthService();
    const response = await authService.register(name, email, password, request, new Response());

    return response;
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
