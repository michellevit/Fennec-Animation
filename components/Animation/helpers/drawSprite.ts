import { spriteAppearance } from "../config/spriteConfig";
import { getGroundMotionEnd } from "./groundMotion";

const JUMP_DURATION = 1.0; // seconds

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number,
  images: Record<string, HTMLImageElement>
) {
  // --- Phase boundaries driven by ground ---
  const motionEnd = getGroundMotionEnd();
  const jumpStart = motionEnd;
  const jumpEnd = jumpStart + JUMP_DURATION;
  const disappearStart = jumpEnd;

  // PRELUDE (0–1): start1 -> start2 once, hold on start2 until run begins
  if (currentTime < 1) {
    const t = currentTime / 1;
    const startFrames = ["/sprite/start1.png", "/sprite/start2.png"];
    const idx = Math.min(1, Math.floor(t * startFrames.length));
    const frameSrc = startFrames[idx];
    const img = images[frameSrc];
    if (!img) return;
    const { scale, offsetX, offsetY } = spriteAppearance;
    const w = img.width * scale,
      h = img.height * scale;
    const x = (canvas.width - w) / 2 + offsetX;
    const y = canvas.height - h - canvas.height * offsetY;
    ctx.drawImage(img, x, y, w, h);
    return;
  }

  // RUN (1 – motionEnd): loop run1/run2
  if (currentTime < motionEnd) {
    const runFrames = ["/sprite/run1.png", "/sprite/run2.png"];
    const fps = 9.5;
    const elapsed = currentTime - 1; //
    const idx = Math.floor(elapsed * fps) % runFrames.length;
    const img = images[runFrames[idx]];
    if (!img) return;
    const { scale, offsetX, offsetY } = spriteAppearance;
    const w = img.width * scale,
      h = img.height * scale;
    const x = (canvas.width - w) / 2 + offsetX;
    const y = canvas.height - h - canvas.height * offsetY;
    ctx.drawImage(img, x, y, w, h);
    return;
  }

  // JUMP (motionEnd – motionEnd+1): jump1..jump5 once, then hide
  if (currentTime < jumpEnd) {
    const jumpFrames = [
      "/sprite/jump1.png",
      "/sprite/jump2.png",
      "/sprite/jump3.png",
      "/sprite/jump4.png",
      "/sprite/jump5.png",
    ];
    const slice = JUMP_DURATION / jumpFrames.length;
    const idx = Math.min(
      jumpFrames.length - 1,
      Math.floor((currentTime - jumpStart) / slice)
    );
    const img = images[jumpFrames[idx]];
    if (!img) return;
    const { scale, offsetX, offsetY } = spriteAppearance;
    const w = img.width * scale,
      h = img.height * scale;
    const x = (canvas.width - w) / 2 + offsetX;
    const y = canvas.height - h - canvas.height * offsetY;
    ctx.drawImage(img, x, y, w, h);
    return;
  }

  // DISAPPEAR (after jump): draw nothing
}
