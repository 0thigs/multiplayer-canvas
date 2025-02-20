import { supabase } from '@/server/supabase-client';

export const POST = async (req: Request) => {
  try {
    // Lê os dados da requisição
    const { userId, name, email } = await req.json();

    // Obtém o token de autenticação do cabeçalho Authorization
    const authorizationHeader = req.headers.get('Authorization');
    if (!authorizationHeader) {
      return new Response(JSON.stringify({ message: 'Token de autenticação ausente' }), { status: 401 });
    }

    const token = authorizationHeader.replace('Bearer ', '');

    // Verifica a sessão de autenticação no Supabase
    const { data, error: sessionError } = await supabase.auth.getUser(token);
    if (sessionError || !data) {
      return new Response(JSON.stringify({ message: 'Sessão de autenticação inválida' }), { status: 401 });
    }

    // Verifica se os parâmetros necessários estão presentes
    if (!userId || !name || !email) {
      return new Response(JSON.stringify({ message: 'Parâmetros faltando' }), { status: 400 });
    }

    // Atualiza os dados do usuário no Supabase
    const { error } = await supabase.auth.updateUser({
      email,
      data: { name },
    });

    if (error) {
      return new Response(JSON.stringify({ message: 'Erro ao atualizar perfil', error }), { status: 500 });
    }

    // Retorna a resposta de sucesso
    return new Response(JSON.stringify({ message: 'Perfil atualizado com sucesso' }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ message: 'Erro interno do servidor' }), { status: 500 });
  }
};
