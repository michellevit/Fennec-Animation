import { getDayState } from "./dayState";

const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
const mix = (a: number[], b: number[], t: number) => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
const rgb = (c: number[]) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

export function drawSky(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number
) {
  const { skyAmt, twilightWarm, sun } = getDayState(canvas, currentTime);

  const dayTop = [90, 165, 235];
  const dayHzn = [170, 210, 245];
  const nightTop = [15, 25, 60];
  const nightHzn = [30, 40, 90];
  const warmTint = [255, 180, 110];
  const violetTop = [110, 120, 200];

  const topBase = mix(nightTop, dayTop, skyAmt);
  const baseBottom = mix(nightHzn, dayHzn, skyAmt);

  const warmFromSun = sun.visible
    ? Math.exp(-Math.pow((sun.alt - 0.16) / 0.33, 2))
    : 0;
  const sunset = sun.visible
    ? Math.exp(-Math.pow((sun.alt - 0.12) / 0.18, 2))
    : 0;

  const warmStrength = Math.min(1, warmFromSun + twilightWarm);
  const bottom = mix(baseBottom, warmTint, 0.55 * warmStrength + 0.25 * sunset);
  const top = mix(topBase, violetTop, 0.2 * sunset);
  const mid = mix(top, bottom, 0.5);

  const midPos = 0.55 + 0.12 * (1 - skyAmt) - 0.08 * sunset;
  const hznPos = 0.82 + 0.06 * (1 - skyAmt) - 0.06 * sunset;

  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0.0, rgb(top));
  g.addColorStop(Math.max(0, Math.min(1, midPos)), rgb(mid));
  g.addColorStop(Math.max(0, Math.min(1, hznPos)), rgb(bottom));
  g.addColorStop(1.0, rgb(bottom));

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
