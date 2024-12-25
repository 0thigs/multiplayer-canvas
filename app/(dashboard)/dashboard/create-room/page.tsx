"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardHeader } from "@/components/dashboard-header";
import { useState } from "react";

export default function CreateRoomPage() {
  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div>
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Create New Room</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="roomName">Room Name</Label>
              <Input
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter room description"
              />
            </div>

            <Button type="submit" className="w-full">
              Create Room
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
