"use client";

import { useState, useEffect } from "react";
import { Button } from "components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "components/ui/popover";
import { Input } from "components/ui/input";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const MAX_HISTORY = 5;

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [colorHistory, setColorHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("colorHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const colors = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#ff8800",
    "#88ff00",
  ];

  useEffect(() => {
    // Update color history when a new color is selected
    if (color && color !== colorHistory[0]) {
      const newHistory = [
        color,
        ...colorHistory.filter((c) => c !== color),
      ].slice(0, MAX_HISTORY);
      setColorHistory(newHistory);
      localStorage.setItem("colorHistory", JSON.stringify(newHistory));
    }
  }, [color]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-10 h-10 p-0"
          style={{ backgroundColor: color }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-48">
        {colorHistory.length > 0 && (
          <>
            <div className="mb-2">
              <p className="text-sm text-muted-foreground mb-1">
                Recent Colors
              </p>
              <div className="grid grid-cols-5 gap-2">
                {colorHistory.map((c) => (
                  <button
                    key={c}
                    className="w-8 h-8 rounded-full border transition-transform hover:scale-110"
                    style={{ backgroundColor: c }}
                    onClick={() => onChange(c)}
                  />
                ))}
              </div>
            </div>
            <div className="h-px bg-border my-2" />
          </>
        )}
        <div>
          <p className="text-sm text-muted-foreground mb-1">Custom Color</p>
          <div className="flex items-center gap-2 mb-4">
            <Input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-10 h-10 p-0 border-0"
            />
            <Input
              type="text"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="h-8"
              placeholder="#000000"
            />
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Default Colors</p>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((c) => (
              <button
                key={c}
                className="w-8 h-8 rounded-full border transition-transform hover:scale-110"
                style={{ backgroundColor: c }}
                onClick={() => onChange(c)}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
