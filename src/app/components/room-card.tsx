"use client";

import { Card } from "components/ui/card";
import { Users } from "lucide-react";
import Link from "next/link";
import { Button } from "components/ui/button";

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
      <Button className="w-full">
        <Link href={`/room/${roomId}`}>Join Room</Link>
      </Button>
    </Card>
  );
};
