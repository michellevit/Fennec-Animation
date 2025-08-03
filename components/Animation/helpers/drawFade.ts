import { fadeConfig } from "../config/fadeConfig";

function ease(t: number, kind: "inCubic" | "outCubic") {
  // clamp 0..1
  const x = Math.min(1, Math.max(0, t));
  return kind === "outCubic" ? 1 - Math.pow(1 - x, 3) : Math.pow(x, 3);
}

/**
 * Draws a fullscreen black overlay with animated alpha for fade in/out.
 * Call this AFTER drawing sky/ground/sprite.
 */
export function drawFade(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number
) {
  const { enabled, in: fin, out: fout } = fadeConfig;
  if (!enabled) return;

  let alpha = 0;

  // Fade-in (black -> clear): alpha goes 1 -> 0
  if (currentTime >= fin.start && currentTime < fin.start + fin.duration) {
    const t = (currentTime - fin.start) / fin.duration;
    const e = ease(t, fin.ease as any);
    alpha = Math.max(alpha, 1 - e);
  } else if (currentTime < fin.start) {
    // Before start, still black
    alpha = Math.max(alpha, 1);
  }

  // Fade-out (clear -> black): alpha goes 0 -> 1
  if (currentTime >= fout.start) {
    const t = (currentTime - fout.start) / fout.duration;
    const e = ease(t, fout.ease as any);
    alpha = Math.max(alpha, e);
  }

  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}
