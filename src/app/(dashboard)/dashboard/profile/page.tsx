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
  const { logout } = useAuth();
  const [userName, setUserName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (data.user) {
          console.log(data.user);
          setUserName(data.user.user_metadata.name);
          setEmail(data.user.email);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        </Card>
      </main>
    </div>
  );
}
