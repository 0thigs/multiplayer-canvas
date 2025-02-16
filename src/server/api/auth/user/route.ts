import { NextResponse } from 'next/server';
import AuthService from '@/server/user/auth';

export async function GET(request: Request) {
  try {
    const authService = new AuthService();
    const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('sb-access-token='))?.split('=')[1];
    const data = await authService.getUser(token);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
