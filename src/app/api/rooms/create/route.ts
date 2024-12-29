import { NextResponse } from 'next/server';
import { createSupabaseClientWithToken } from '@/server/supabase-client';

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();

    const cookieHeader = req.headers.get('cookie') || '';
    const token = cookieHeader
      .split('; ')
      .find(row => row.startsWith('sb-access-token='))
      ?.split('=')[1];

    console.log('Token extraído para criação:', token); 

    if (!token) {
      console.error('Token de autenticação não encontrado nos cookies.');
      return NextResponse.json({ message: 'Autenticação necessária.' }, { status: 401 });
    }

    const supabaseClient = createSupabaseClientWithToken(token);

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('Usuário não encontrado para o token fornecido:', userError);
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }

    console.log('Usuário autenticado:', user.id);

    const { data, error } = await supabaseClient
      .from('rooms')
      .insert([
        {
          name,
          description,
          creator_id: user.id,
        },
      ]);

    return NextResponse.json({ message: 'Sala criada com sucesso.' }, { status: 201 });
  } catch (error: any) {
    console.error('Erro na rota API /api/rooms/create:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
