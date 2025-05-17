// Updated Animation.tsx with spritePhaseTimings removed

import { useEffect, useState } from "react";
import { spriteFrames } from "@/components/Animation/config/spriteConfig";
import { groundTimeline } from "@/components/Animation/config/groundConfig";
import { preloadImages } from "@/utils/preloadImages";
import { drawSky } from "./helpers/drawSky";
import { drawGround } from "./helpers/drawGround";
import { drawSprite } from "./helpers/drawSprite";

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
    const allGroundImages = groundTimeline.flatMap((segment) => segment.frames);
    const allSpriteFrames = [
      ...spriteFrames.start,
      ...spriteFrames.run,
      ...spriteFrames.jump,
    ];
    const allFrames = [...allSpriteFrames, ...allGroundImages];
    preloadImages(allFrames).then(setImages);
  }, []);

  useEffect(() => {
    if (!canvas || !ctx || Object.keys(images).length === 0) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawSky(ctx, canvas);
    drawGround(ctx, canvas, currentTime, images);
    drawSprite(ctx, canvas, currentTime, images);
  }, [canvas, ctx, currentTime, images]);

  return null;
}
