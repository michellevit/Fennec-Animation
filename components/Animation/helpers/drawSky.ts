import { getDayState } from "./dayState";

const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
const mix = (
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
) =>
  [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)] as [
    number,
    number,
    number
  ];
const rgb = (c: [number, number, number]) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

export function drawSky(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number
) {
  const { skyAmt, twilight } = getDayState(canvas, currentTime);

  // cool zenith → warm horizon
  const nightTop: [number, number, number] = [15, 22, 60];
  const dayTop: [number, number, number] = [120, 190, 255];

  const nightBot: [number, number, number] = [10, 15, 40];
  const dayBot: [number, number, number] = [100, 170, 235];

  const warm: [number, number, number] = [255, 180, 110];

  const top = mix(nightTop, dayTop, skyAmt);
  const botBase = mix(nightBot, dayBot, skyAmt);
  const warmAmt = Math.min(1, twilight * 0.85);
  const bottom = mix(botBase, warm, warmAmt);

  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, rgb(top));
  g.addColorStop(1, rgb(bottom));

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
