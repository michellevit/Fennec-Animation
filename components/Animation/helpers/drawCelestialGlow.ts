// drawCelestialGlow.ts
import { getDayState } from "./dayState";

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

export function drawCelestialGlow(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number
) {
  const ds = getDayState(canvas, currentTime);
  const isDay = ds.isDay;
  const a = isDay
    ? { x: ds.sun.x, y: ds.sun.y, eased: ds.sun.easedAlt }
    : { x: ds.moon.x, y: ds.moon.y, eased: ds.moon.easedAlt };

  let base = isDay
    ? 0.55 + 0.35 * a.eased
    : 0.3 + 0.28 * (1 - ds.skyAmt) + 0.1 * a.eased;

  const strength = clamp(base, 0.22, isDay ? 0.92 : 0.62);
  const BLUR_PX = isDay ? 12 : 10;
  const INNER_R = 20;
  const OUTER_R = isDay ? 280 : 200;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.filter = `blur(${BLUR_PX}px)`;
  ctx.globalAlpha = strength;

  const g = ctx.createRadialGradient(a.x, a.y, INNER_R, a.x, a.y, OUTER_R);
  if (isDay) {
    g.addColorStop(0.0, "rgba(255,240,200,0.65)");
    g.addColorStop(0.25, "rgba(255,225,160,0.34)");
    g.addColorStop(0.55, "rgba(255,210,120,0.16)");
    g.addColorStop(0.85, "rgba(255,200,100,0.06)");
    g.addColorStop(1.0, "rgba(255,200,100,0.00)");
  } else {
    g.addColorStop(0.0, "rgba(210,230,255,0.40)");
    g.addColorStop(0.3, "rgba(200,220,255,0.22)");
    g.addColorStop(0.6, "rgba(190,210,255,0.10)");
    g.addColorStop(0.88, "rgba(190,210,255,0.04)");
    g.addColorStop(1.0, "rgba(190,210,255,0.00)");
  }

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(a.x, a.y, OUTER_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.filter = "none";
}
