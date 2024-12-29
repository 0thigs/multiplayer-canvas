import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_JWT_SECRET!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        detectSessionInUrl: false,
    },
});

export const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        persistSession: false,
        detectSessionInUrl: false,
    },
});

export const createSupabaseClientWithToken = (token: string) => {
    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            detectSessionInUrl: false,
        },
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });
};
