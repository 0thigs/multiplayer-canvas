"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";

export default function DashboardPage() {
  return (
    <div>
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Rooms</h1>
          <Button asChild>
            <Link href="/dashboard/create-room">
              <Plus className="mr-2 h-4 w-4" /> Create Room
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Project Brainstorm</h3>
              <Users className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Active participants: 3</p>
            <Button asChild className="w-full">
              <Link href="/room/123">Join Room</Link>
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Design Workshop</h3>
              <Users className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Active participants: 5</p>
            <Button asChild className="w-full">
              <Link href="/room/456">Join Room</Link>
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
