"use client";

import { Button } from "components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "components/dashboard-header";
import { useEffect, useState } from "react";
import { RoomCard } from "@/app/components/room-card";

interface Room {
  id: string;
  name: string;
  description: string | null;
  creator_id: string;
  created_at: string;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndRooms = async () => {
      try {
        const userResponse = await fetch("/api/auth/user", {
          method: "GET",
          credentials: "include",
        });
        const userData = await userResponse.json();
        if (userData.user) {
          setUserName(userData.user.user_metadata.name);
        }

        const roomsResponse = await fetch("/api/rooms/index", {
          method: "GET",
          credentials: "include",
        });
        const roomsData = await roomsResponse.json();
        if (roomsData.rooms) {
          setRooms(roomsData.rooms);
        }

        setLoading(false);
      } catch (error: any) {
        setError(error.message || "Erro ao buscar salas.");
        setLoading(false);
      }
    };

    fetchUserAndRooms();
  }, []);

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;

  return (
    <div>
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Rooms, {userName}</h1>
          <Button asChild>
            <Link href="/dashboard/create-room">
              <Plus className="mr-2 h-4 w-4" /> Create Room
            </Link>
          </Button>
        </div>

        {rooms.length === 0 ? (
          <p className="text-center">You have no rooms yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                roomName={room.name}
                description={room.description || ""}
                participants={3}
                roomId={room.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
