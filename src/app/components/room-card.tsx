"use client";

import { Card } from "components/ui/card";
import { Users } from "lucide-react";
import Link from "next/link";
import { Button } from "components/ui/button";
import { useRouter } from "next/navigation";

interface RoomCardProps {
  roomName: string;
  description?: string | null;
  participants: number;
  roomId: string;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  roomName,
  description,
  participants,
  roomId,
}) => {
  const router = useRouter();

  const deleteRoom = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this room?");
    
    console.log(roomId);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/rooms/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete room");
      }

      alert("Room deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Failed to delete room. Please try again.");
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{roomName}</h3>
        <Users className="text-muted-foreground" />
      </div>
      {description && (
        <p className="text-muted-foreground mb-4">{description}</p>
      )}
      <p className="text-muted-foreground mb-4">
        Active participants: {participants}
      </p>
      <div className="flex flex-row gap-2">
        <Button className="w-full">
          <Link href={`/room/${roomId}`}>Join Room</Link>
        </Button>
        <Button
          onClick={deleteRoom}
          className="w-[20%] bg-red-500 text-white hover:bg-red-600"
        >
          Delete
        </Button>
      </div>
    </Card>
  );
};
