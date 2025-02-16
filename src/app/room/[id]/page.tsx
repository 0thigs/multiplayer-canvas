"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "components/ui/button";
import {
  Brush,
  Eraser,
  Download,
  Users,
  CornerDownLeft,
  Trash2,
  Undo,
} from "lucide-react";
import { Canvas, CanvasHandle } from "components/canvas";
import { ColorPicker } from "components/color-picker";
import { useRouter } from "next/navigation";
import { supabase } from "../../../server/supabase-client";
import type { User } from "@supabase/supabase-js";

interface RoomPageProps {
  params: {
    id: string;
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  const [color, setColor] = useState("#000000");
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [lineWidth, setLineWidth] = useState(5);
  const router = useRouter();

  const canvasRef = useRef<CanvasHandle>(null);

  const [shareMessage, setShareMessage] = useState(false);
  const [saveMessage, setSaveMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roomId = params.id;

  const getCurrentUser = async (): Promise<User | null> => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Erro ao obter usuário:", error);
      return null;
    }
    return data.user;
  };

  const saveCanvasState = useCallback(async () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current.getCanvas();
      if (!canvas) {
        console.error("Canvas não encontrado.");
        return;
      }
      const canvasDataUrl = canvas.toDataURL("image/png");

      try {
        const response = await fetch(`/api/rooms/${roomId}/update-canvas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            canvasState: canvasDataUrl,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao salvar o estado do canvas:", errorData);
          setErrorMessage("Erro ao salvar o estado do canvas.");
        } else {
          console.log("Estado do canvas salvo com sucesso.");
          setSaveMessage(true);
          setTimeout(() => setSaveMessage(false), 2000);
        }
      } catch (error) {
        console.error("Erro na requisição para salvar o canvas:", error);
        setErrorMessage("Erro na requisição para salvar o canvas.");
      }
    }
  }, [roomId]);

  useEffect(() => {
    const joinRoom = async () => {
      const user = await getCurrentUser();
      if (user) {
        const { error } = await supabase
          .from("room_participants")
          .insert([{ room_id: roomId, user_id: user.id }]);

        if (error) {
          console.error("Erro ao entrar na sala:", error);
          setErrorMessage("Erro ao entrar na sala.");
        } else {
          console.log(`Usuário ${user.id} entrou na sala ${roomId}`);
        }
      }
    };

    const leaveRoom = async () => {
      const user = await getCurrentUser();
      if (user) {
        const { error } = await supabase
          .from("room_participants")
          .delete()
          .eq("room_id", roomId)
          .eq("user_id", user.id);

        if (error) {
          console.error("Erro ao sair da sala:", error);
          setErrorMessage("Erro ao sair da sala.");
        } else {
          console.log(`Usuário ${user.id} saiu da sala ${roomId}`);
        }
      }
    };

    joinRoom();

    return () => {
      leaveRoom();
      saveCanvasState(); // Salva o estado do canvas ao desmontar o componente
    };
  }, [roomId, saveCanvasState]);

  useEffect(() => {
    const fetchCanvasState = async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("canvas_state")
        .eq("id", roomId)
        .single();

      if (error) {
        console.error("Erro ao buscar estado do canvas:", error);
        setErrorMessage("Erro ao buscar estado do canvas.");
        return;
      }

      if (data.canvas_state && canvasRef.current) {
        const img = new Image();
        img.src = data.canvas_state;
        img.onload = () => {
          const canvas = canvasRef.current?.getCanvas();
          const ctx = canvas?.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
        };
      }
    };

    fetchCanvasState();
  }, [roomId]);

  const download = () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!canvas) {
      console.error("Canvas não encontrado para download.");
      setErrorMessage("Canvas não encontrado para download.");
      return;
    }
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = url;
    link.click();
  };

  const leaveRoomHandler = () => {
    saveCanvasState(); // Salva o estado antes de sair
    router.push("/dashboard");
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    saveCanvasState(); // Salva o estado após limpar o canvas
  };

  const handleShare = () => {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        setShareMessage(true);
        setTimeout(() => setShareMessage(false), 2000);
      })
      .catch((err) => {
        console.error("Erro ao copiar o link: ", err);
        setErrorMessage("Erro ao copiar o link.");
      });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant={tool === "brush" ? "default" : "outline"}
                size="icon"
                onClick={() => setTool("brush")}
                title="Pincel"
              >
                <Brush className="h-5 w-5" />
              </Button>
              <Button
                variant={tool === "eraser" ? "default" : "outline"}
                size="icon"
                onClick={() => setTool("eraser")}
                title="Borracha"
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
                title="Largura da Linha"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleUndo}
                title="Desfazer"
              >
                <Undo className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleClear}
                title="Limpar Quadro"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={leaveRoomHandler}
                title="Voltar"
              >
                <CornerDownLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={download}
                title="Baixar Imagem"
              >
                <Download className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center"
                title="Compartilhar"
              >
                <Users className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow relative">
        <Canvas
          ref={canvasRef}
          id="canvas"
          color={color}
          tool={tool}
          lineWidth={lineWidth}
          roomId={roomId}
        />
      </main>

      {shareMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out">
          Link copiado para o clipboard!
        </div>
      )}

      {saveMessage && (
        <div className="fixed bottom-4 left-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out">
          Estado do canvas salvo!
        </div>
      )}

      {errorMessage && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
