import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export default class AuthService {
  async login(email: string, password: string, req: Request, res: Response) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("Error logging in", error);
      throw new Error(error.message);
    }

    if (data.session?.access_token) {
      const headers = new Headers();
      headers.append('Set-Cookie', `sb-access-token=${data.session.access_token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`);
      return new NextResponse(JSON.stringify(data), { headers });
    }

    return new NextResponse(JSON.stringify(data));
  }

  async register(name: string, email: string, password: string, req: Request, res: Response) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: "http://localhost:3000/dashboard",
      },
    });

    if (error) {
      console.log("Error registering", error);
      throw new Error(error.message);
    }

    if (data.session?.access_token) {
      const headers = new Headers();
      headers.append('Set-Cookie', `sb-access-token=${data.session.access_token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`);
      return new NextResponse(JSON.stringify(data), { headers });
    }

    return new NextResponse(JSON.stringify(data));
  }

  async logout(req: Request, res: Response) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log("Error logging out", error);
      throw new Error(error.message);
    }

    const headers = new Headers();
    headers.append('Set-Cookie', `sb-access-token=deleted; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`);
    return new NextResponse(JSON.stringify({ message: 'Logged out' }), { headers });
  }

  async getUser(token?: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      console.log("Error getting user", error);
      throw new Error(error.message);
    }

    return data;
  }

  async isLoggedIn(token?: string) {
    const supabase = await createSupabaseServerClient();
    try {
      const { data, error } = await supabase.auth.getUser(token);

      if (error) {
        console.error("Error retrieving user:", error);
        return false;
      }
      return data.user ? true : false;
    } catch (err) {
      console.error("Unexpected error in isLoggedIn:", err);
      return false;
    }
  }
}
