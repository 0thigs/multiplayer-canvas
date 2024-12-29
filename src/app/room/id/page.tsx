"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "components/ui/button";
import { Brush, Eraser, Download, Users } from "lucide-react";
import { Canvas } from "components/canvas";
import { ColorPicker } from "components/color-picker";

export default function RoomPage({ params }: { params: { id: string } }) {
  const [color, setColor] = useState("#000000");
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [lineWidth, setLineWidth] = useState(5);

  function download() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const url = canvas?.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "filename.png";
    link.href = url;
    link.click();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant={tool === "brush" ? "default" : "outline"}
                size="icon"
                onClick={() => setTool("brush")}
              >
                <Brush className="h-5 w-5" />
              </Button>
              <Button
                variant={tool === "eraser" ? "default" : "outline"}
                size="icon"
                onClick={() => setTool("eraser")}
              >
                <Eraser className="h-5 w-5" />
              </Button>
              <ColorPicker color={color} onChange={setColor} />
              <input
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                className="w-32"
              />
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={download}>
                <Download className="h-5 w-5" />
              </Button>
              <Button variant="outline">
                <Users className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Canvas
          id="canvas"
          color={color}
          tool={tool}
          lineWidth={lineWidth}
          roomId={params.id}
        />
      </main>
    </div>
  );
}
