import { NextResponse } from "next/server";
import { createSupabaseClientWithToken } from '@/server/supabase-client';

export async function DELETE(req: Request) {
  try {
    const { roomId } = await req.json();

    const cookieHeader = req.headers.get('cookie') || '';
    const token = cookieHeader
      .split('; ')
      .find(row => row.startsWith('sb-access-token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ message: 'Autenticação necessária.' }, { status: 401 });
    }

    const supabaseClient = createSupabaseClientWithToken(token);

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }

    const { data: room, error: roomError } = await supabaseClient
      .from('rooms')
      .select('creator_id')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ message: 'Sala não encontrada.' }, { status: 404 });
    }

    if (room.creator_id !== user.id) {
      return NextResponse.json({ message: 'Sem permissão para deletar esta sala.' }, { status: 403 });
    }

    const { error: deleteError } = await supabaseClient
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ message: 'Sala deletada com sucesso.' }, { status: 200 });
  } catch (error: any) {
    console.error('Erro na rota API /api/rooms/delete:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}