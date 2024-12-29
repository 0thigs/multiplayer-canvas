import { NextResponse } from 'next/server';
import { createSupabaseClientWithToken } from '@/server/supabase-client';

export async function GET(req: Request) {
    const cookieHeader = req.headers.get('cookie') || '';

    const token = cookieHeader
        .split('; ')
        .find(row => row.startsWith('sb-access-token='))
        ?.split('=')[1];

    console.log('Token extraído:', token); 

    if (!token) {
        console.error('Token de autenticação não encontrado nos cookies.');
        return NextResponse.json({ message: 'Autenticação necessária.' }, { status: 401 });
    }

    const supabaseClient = createSupabaseClientWithToken(token);

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        console.error('Erro ao obter usuário:', userError);
        return NextResponse.json({ message: 'Autenticação necessária.' }, { status: 401 });
    }

    const { data, error } = await supabaseClient
        .from('rooms')
        .select('*')
        .eq('creator_id', user.id);

    if (error) {
        console.error('Erro ao buscar salas:', error);
        return NextResponse.json({ message: 'Erro ao buscar salas.' }, { status: 500 });
    }

    console.log('Salas buscadas com sucesso:', data); 

    return NextResponse.json({ rooms: data }, { status: 200 });
}
