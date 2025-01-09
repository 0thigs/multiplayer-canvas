import { NextResponse } from 'next/server';
import { createSupabaseClientWithToken } from '@/server/supabase-client';

export async function POST(req: Request) {
  console.log('Rota /api/rooms/updateCanvas chamada');
  
  try {
    const { roomId, canvasState } = await req.json();
    console.log('Parâmetros recebidos:', { roomId, canvasState });

    if (!roomId || !canvasState) {
      console.error('Parâmetros faltando:', { roomId, canvasState });
      return NextResponse.json(
        { message: 'Parâmetros faltando' },
        { status: 400 }
      );
    }

    const cookieHeader = req.headers.get('cookie') || '';
    const token = cookieHeader
      .split('; ')
      .find(row => row.startsWith('sb-access-token='))
      ?.split('=')[1];

    if (!token) {
      console.error('Token de autenticação não encontrado nos cookies.');
      return NextResponse.json(
        { message: 'Autenticação necessária' },
        { status: 401 }
      );
    }

    console.log('Token extraído:', token);

    const supabaseClient = createSupabaseClientWithToken(token);
    console.log('Cliente Supabase criado');

    const { data, error } = await supabaseClient
      .from('rooms')
      .update({ canvas_state: canvasState })
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar estado do canvas:', error);
      return NextResponse.json(
        { message: 'Erro ao atualizar estado do canvas', error },
        { status: 500 }
      );
    }

    console.log('Estado do canvas atualizado com sucesso:', data);
    return NextResponse.json(
      { message: 'Estado do canvas atualizado com sucesso', data },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao atualizar canvas:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
