"use client";

import { useEffect, useRef } from "react";

interface CanvasProps {
  id: string;
  color: string;
  tool: "brush" | "eraser";
  lineWidth: number;
  roomId: string;
}

export function Canvas({ id, color, tool, lineWidth, roomId }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth - 100;
    canvas.height = window.innerHeight - 200;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    function draw(e: MouseEvent) {
      if (!isDrawing.current) return;

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(lastX.current, lastY.current);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.stroke();

      lastX.current = e.offsetX;
      lastY.current = e.offsetY;
    }

    canvas.addEventListener("mousedown", (e) => {
      isDrawing.current = true;
      lastX.current = e.offsetX;
      lastY.current = e.offsetY;
    });

    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", () => (isDrawing.current = false));
    canvas.addEventListener("mouseout", () => (isDrawing.current = false));

    return () => {
      canvas.removeEventListener("mousedown", () => {});
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", () => {});
      canvas.removeEventListener("mouseout", () => {});
    };
  }, [color, tool, lineWidth]);

  return (
    <div className="flex justify-center">
      <canvas
        id={id}
        ref={canvasRef}
        className="border rounded-lg shadow-lg bg-white"
      />
    </div>
  );
}
