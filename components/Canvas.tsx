"use client";

// components/Canvas.tsx

import React, { useRef, useEffect, useState } from "react";
import "./Canvas.css";
import Animation from "@/components/Animation";

export type AnimationCanvasProps = {
  currentTime: number;
  isPlaying: boolean;
};

export default function AnimationCanvas({
  currentTime,
  isPlaying,
}: AnimationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (context) setCtx(context);

    const BASE_WIDTH = 800;
    const BASE_HEIGHT = 400;

    const resize = () => {
      canvas.width = BASE_WIDTH;
      canvas.height = BASE_HEIGHT;
    };

    resize();
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="canvas-wrapper">
      <canvas ref={canvasRef} className="animation-canvas" />
      <Animation
        canvas={canvasRef.current}
        ctx={ctx}
        currentTime={currentTime}
        isPlaying={isPlaying}
      />
    </div>
  );
}
