import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/server/supabase-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { roomId, userId } = req.body;

  if (!roomId || !userId) {
    return res.status(400).json({ message: 'Parâmetros faltando' });
  }

  const { data, error } = await supabase
    .from('room_participants')
    .insert([{ room_id: roomId, user_id: userId }]);

  if (error) {
    return res.status(500).json({ message: 'Erro ao adicionar participante', error });
  }

  return res.status(200).json({ message: 'Participante adicionado com sucesso', data });
}
