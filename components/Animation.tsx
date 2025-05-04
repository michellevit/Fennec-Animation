// components/Animation.tsx

import { useEffect } from "react";
import { spriteTimeline } from "./timelineMap";

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
  isPlaying,
}: AnimationProps) {
  useEffect(() => {
    // Don't try to draw if canvas or context aren't ready
    if (!canvas || !ctx) return;

    // 1. Clear the canvas each time we re-draw so the old image doesn't linger
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Find the most recent sprite frame whose timestamp is <= currentTime
    const currentFrame = spriteTimeline.findLast(
      (frame) => currentTime >= frame.time
    );

    if (currentFrame) {
      // 3. Create a new HTMLImageElement and set its source to the frame's sprite
      const img = new Image();
      img.src = currentFrame.src;

      // 4. Once the image is loaded, draw it
      img.onload = () => {
        const scale = 0.25; // Shrink to 25% of original size
        const spriteWidth = img.width * scale;
        const spriteHeight = img.height * scale;

        // 5. Center the sprite horizontally
        const x = (canvas.width - spriteWidth) / 2;

        // 6. Position it in the bottom quarter of the screen (like it's on the ground)
        const y = canvas.height - spriteHeight - canvas.height * 0.25;

        // 7. Draw the image on the canvas
        ctx.drawImage(img, x, y, spriteWidth, spriteHeight);
      };
    }
  }, [canvas, ctx, currentTime]);

  return null;
}
