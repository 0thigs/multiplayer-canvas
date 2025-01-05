"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { supabase } from '@/server/supabase-client';

interface CanvasProps {
  id: string;
  color: string;
  tool: "brush" | "eraser";
  lineWidth: number;
  roomId: string;
}

export interface CanvasHandle {
  undo: () => void;
  clear: () => void;
  getCanvas: () => HTMLCanvasElement | null;
}

export const Canvas = forwardRef<CanvasHandle, CanvasProps>(
  ({ id, color, tool, lineWidth, roomId }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDrawing = useRef(false);
    const lastX = useRef(0);
    const lastY = useRef(0);

    const colorRef = useRef(color);
    const toolRef = useRef(tool);
    const lineWidthRef = useRef(lineWidth);

    const historyRef = useRef<string[]>([]);
    const maxHistory = 50;

    useEffect(() => {
      colorRef.current = color;
    }, [color]);

    useEffect(() => {
      toolRef.current = tool;
    }, [tool]);

    useEffect(() => {
      lineWidthRef.current = lineWidth;
    }, [lineWidth]);

    const saveHistory = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const dataURL = canvas.toDataURL();
        historyRef.current.push(dataURL);
        if (historyRef.current.length > maxHistory) {
          historyRef.current.shift();
        }
      }
    };

    useImperativeHandle(ref, () => ({
      undo: () => {
        if (historyRef.current.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const dataURL = historyRef.current.pop();
        if (dataURL) {
          const img = new Image();
          img.src = dataURL;
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
        }
      },
      clear: () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        saveHistory();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        sendDrawingAction({ action: 'clear' });
      },
      getCanvas: () => canvasRef.current,
    }));

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const tempData = canvas.toDataURL();
        const img = new Image();
        img.src = tempData;
        img.onload = () => {
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        };
      }
    };

    useEffect(() => {
      resizeCanvas();

      window.addEventListener("resize", resizeCanvas);

      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }, []);

    const saveCanvasState = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error('Sessão não encontrada');
          return;
        }

        const canvasState = canvas.toDataURL();
        const response = await fetch('/api/rooms/update-canvas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            roomId,
            canvasState,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao salvar estado do canvas');
        }
      } catch (error) {
        console.error('Erro ao salvar estado do canvas:', error);
      }
    };

    function debounce(func: () => void, wait: number) {
      let timeout: NodeJS.Timeout;
      return () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          func();
        }, wait);
      };
    }

    const debouncedSave = useRef(
      debounce(() => {
        saveCanvasState();
      }, 2000)
    ).current;

    const sendDrawingAction = (action: any) => {
      supabase
        .channel(`room-${roomId}`)
        .send({
          type: 'broadcast',
          event: 'draw',
          payload: { data: action },
        })
        .then((response: any) => {
          if (response.error) {
            console.error('Erro ao enviar ação de desenho:', response.error);
          }
        });
    };

    useEffect(() => {
      const setupChannel = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        const channel = supabase
          .channel(`room-${roomId}`, {
            config: {
              broadcast: { self: true },
              presence: { key: session?.user?.id },
            }
          })
          .on('broadcast', { event: 'draw' }, (payload: any) => {
            if (!payload || !payload.payload) {
              console.error('Payload inválido recebido:', payload);
              return;
            }

            const { data } = payload.payload;
            
            if (!data) {
              console.error('Dados inválidos recebidos:', payload);
              return;
            }

            if (data.action === 'clear') {
              const ctx = canvasRef.current?.getContext('2d');
              if (ctx && canvasRef.current) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              }
              return;
            }

            const ctx = canvasRef.current?.getContext('2d');
            if (ctx && canvasRef.current) {
              ctx.beginPath();
              ctx.moveTo(data.lastX, data.lastY);
              ctx.lineTo(data.currentX, data.currentY);
              ctx.strokeStyle = data.tool === 'eraser' ? '#ffffff' : data.color;
              ctx.lineWidth = data.lineWidth;
              ctx.lineCap = 'round';
              ctx.stroke();
            }
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      };

      setupChannel();
    }, [roomId]);

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      function draw(e: MouseEvent) {
        if (!isDrawing.current) return;

        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        ctx.beginPath();
        ctx.moveTo(lastX.current, lastY.current);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.strokeStyle =
          toolRef.current === "eraser" ? "#ffffff" : colorRef.current;
        ctx.lineWidth = lineWidthRef.current;
        ctx.lineCap = "round";
        ctx.stroke();

        const action = {
          lastX: lastX.current,
          lastY: lastY.current,
          currentX: e.offsetX,
          currentY: e.offsetY,
          color: colorRef.current,
          tool: toolRef.current,
          lineWidth: lineWidthRef.current,
        };
        sendDrawingAction(action);

        debouncedSave();

        lastX.current = e.offsetX;
        lastY.current = e.offsetY;
      }

      const handleMouseDown = (e: MouseEvent) => {
        isDrawing.current = true;
        lastX.current = e.offsetX;
        lastY.current = e.offsetY;
        saveHistory();
      };

      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", draw);
      canvas.addEventListener("mouseup", () => (isDrawing.current = false));
      canvas.addEventListener("mouseout", () => (isDrawing.current = false));

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", draw);
        canvas.removeEventListener("mouseup", () => (isDrawing.current = false));
        canvas.removeEventListener("mouseout", () => (isDrawing.current = false));
      };
    }, [debouncedSave]);

    return (
      <div ref={containerRef} className="absolute top-0 left-0 right-0 bottom-0">
        <canvas
          id={id}
          ref={canvasRef}
          className="w-full h-full border rounded-lg shadow-lg bg-white"
        />
      </div>
    );
  }
);

Canvas.displayName = "Canvas";
