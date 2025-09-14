// components/Animation/helpers/drawSprite.ts
import { spriteAppearance } from "../config/spriteConfig";
import { getGroundMotionEnd } from "./groundMotion";
import { beatSync } from "../config/spriteConfig";

const JUMP_DURATION = 1.0;

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number,
  images: Record<string, HTMLImageElement>
) {
  const motionEnd = getGroundMotionEnd();
  const jumpStart = motionEnd;
  const jumpEnd = jumpStart + JUMP_DURATION;

  // PRELUDE (0–1)
  if (currentTime < 1) {
    const t = currentTime / 1;
    const startFrames = ["/sprite/start1.png", "/sprite/start2.png"];
    const idx = Math.min(1, Math.floor(t * startFrames.length));
    const img = images[startFrames[idx]];
    if (!img) return;
    const { scale, offsetX, offsetY } = spriteAppearance;
    const w = img.width * scale,
      h = img.height * scale;
    const x = (canvas.width - w) / 2 + offsetX;
    const y = canvas.height - h - canvas.height * offsetY;
    ctx.drawImage(img, x, y, w, h);
    return;
  }

  // RUN (steady BPM)
  if (currentTime < motionEnd) {
    const runFrames = ["/sprite/run1.png", "/sprite/run2.png"];

    // Map canvas time -> audio time reference
    const audioTime =
      currentTime + beatSync.audioLeadSec - beatSync.runStartsAtSec;

    // Beats elapsed since your sync point
    const beats = Math.max(0, audioTime) * (beatSync.bpm / 60);

    // Flip frames at a constant musical rate (even gait)
    const toggles = Math.floor(beats * beatSync.framesPerBeat);
    const idx = toggles % runFrames.length;

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

  // JUMP
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

  // DISAPPEAR: after jumping into hole, draw nothing
}
