"use client";

import { Button } from "components/ui/button";
import { Card } from "components/ui/card";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { DashboardHeader } from "components/dashboard-header";
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import { useEffect, useState } from "react";
import useAuth from "@/app/hooks/use-auth";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export default function ProfilePage() {
  const { logout, getUserToken } = useAuth(); // Garantir que o token seja obtido
  const [userName, setUserName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (data.user) {
          setUserName(data.user.user_metadata.name);
          setEmail(data.user.email);
          setUserId(data.user.id);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !userName || !email) {
      setMessage("Todos os campos são obrigatórios.");
      return;
    }
  
    const token = await getUserToken(); // Obtenha o token de autenticação
  
    if (!token) {
      setMessage("Token de autenticação ausente");
      return;
    }
  
    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Envie o token corretamente
        },
        body: JSON.stringify({ userId, name: userName, email }),
      });
  
      const data = await response.json();
      console.log("API Response:", data); // Verifique a resposta da API
  
      if (response.ok) {
        setMessage("Perfil atualizado com sucesso.");
      } else {
        setMessage(data.message || "Erro ao atualizar perfil.");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      setMessage("Erro ao atualizar perfil.");
    }
  };
  

  return (
    <div>
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8">
          <div className="flex justify-between items-center">
            <Link href="/dashboard">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
          </div>
          <div className="flex flex-col items-center mb-8">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={userName ?? ""}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email ?? ""}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
              <Button onClick={logout} variant="outline" className="ml-4">
                Logout
              </Button>
            </div>
          </form>
          {message && <p>{message}</p>}
        </Card>
      </main>
    </div>
  );
}
