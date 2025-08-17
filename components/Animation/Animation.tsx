// components/Animation/Animation.tsx

import { useEffect, useState } from "react";
import { preloadImages } from "@/utils/preloadImages";
import { drawSky } from "./helpers/drawSky";
import { drawCelestials } from "./helpers/drawCelestials";
import { drawGlobalLight } from "./helpers/drawGlobalLight";
import { drawCelestialGlow } from "./helpers/drawCelestialGlow";
import { drawGround } from "./helpers/drawGround";
import { drawSprite } from "./helpers/drawSprite";
import { drawFade } from "./helpers/drawFade";

import {
  scenes,
  transitions,
} from "@/components/Animation/config/groundConfig";
import { spritePhaseTimings } from "@/components/Animation/config/spriteConfig";

type AnimationProps = {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  currentTime: number;
  isPlaying: boolean;
};

export default function Animation({
  canvas,
  ctx,
  currentTime,
}: AnimationProps) {
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    const groundFrames = [
      ...scenes.flatMap((scene) => scene.frames),
      ...transitions.map((t) => t.frame),
    ];
    const spriteFrames = spritePhaseTimings.flatMap((phase) => phase.frames);

    const celestialElements = ["/elements/sun.png", "/elements/moon.png"];

    const allFrames = Array.from(
      new Set([...groundFrames, ...spriteFrames, ...celestialElements])
    );

    preloadImages(allFrames).then(setImages);
  }, []);

  useEffect(() => {
    if (!canvas || !ctx || Object.keys(images).length === 0) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSky(ctx, canvas, currentTime);
    drawCelestials(ctx, canvas, currentTime, images);
    drawGlobalLight(ctx, canvas, currentTime);
    drawCelestialGlow(ctx, canvas, currentTime);
    drawGround(ctx, canvas, currentTime, images);
    drawSprite(ctx, canvas, currentTime, images);
    drawFade(ctx, canvas, currentTime);
  }, [canvas, ctx, currentTime, images]);

  return null;
}
