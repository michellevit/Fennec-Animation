import { getDayState } from "./dayState";

export function drawGlobalLight(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number
) {
  const { skyAmt, twilight } = getDayState(canvas, currentTime);

  const MAX_DARK = 0.55;
  // during twilight, keep things brighter so warm hues read nicely
  const gamma = 1.2 - 0.4 * Math.min(1, twilight); // 1.2 → 0.8
  const darkness = Math.pow(1 - skyAmt, gamma) * MAX_DARK;

  if (darkness <= 0.002) return;
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${darkness})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}
