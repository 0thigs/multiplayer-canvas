import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      router.push('/dashboard');
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro no login');
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro no registro');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro no logout');
      throw err;
    }
  };

  const getUserToken = async () => {
    // Aqui você precisa garantir que o token esteja no cookie ou localStorage
    // Exemplo:
    const token = document.cookie.split('; ').find(row => row.startsWith('sb-access-token='))?.split('=')[1];
    return token;
  };

  return { login, register, logout, error, getUserToken };
};

export default useAuth;
