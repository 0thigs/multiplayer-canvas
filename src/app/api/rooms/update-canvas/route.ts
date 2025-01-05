import { NextResponse } from 'next/server';
import { createSupabaseClientWithToken } from '@/server/supabase-client';

export async function POST(req: Request) {
  try {
    const { roomId, canvasState } = await req.json();

    if (!roomId || !canvasState) {
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
      return NextResponse.json(
        { message: 'Autenticação necessária' },
        { status: 401 }
      );
    }

    const supabaseClient = createSupabaseClientWithToken(token);

    const { data, error } = await supabaseClient
      .from('rooms')
      .update({ canvas_state: canvasState })
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao atualizar estado do canvas', error },
        { status: 500 }
      );
    }

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
