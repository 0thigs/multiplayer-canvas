import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background flex justify-center items-center to-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-4xl font-bold">Multiplayer Canvas</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Create, collaborate, and share your drawings in real-time. Join our
            creative community today!
          </p>
          <div className="flex space-x-4">
            <Button asChild size="lg">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">Register</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">
                Real-time Collaboration
              </h3>
              <p className="text-muted-foreground">
                Draw together with friends and colleagues in real-time.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">Multiple Tools</h3>
              <p className="text-muted-foreground">
                Access various drawing tools and features for your creativity.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">Save & Share</h3>
              <p className="text-muted-foreground">
                Save your work and share it with the community.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
