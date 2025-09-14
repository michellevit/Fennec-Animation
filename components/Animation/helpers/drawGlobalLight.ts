import { getDayState } from "./dayState";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function drawGlobalLight(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number
) {
  const { skyAmt, twilightWarm, sun: S } = getDayState(canvas, currentTime);

  const MAX_DARK = 0.48;
  const START_DIM_ALT = 0.35;
  const FULL_DIM_ALT = 0.12;

  const sunLow = 1 - smoothstep(FULL_DIM_ALT, START_DIM_ALT, S.easedAlt);

  const dayTwilightRelief = 1 - 0.35 * clamp01(twilightWarm);
  const nightTwilightRelief = 1 - 0.45 * clamp01(twilightWarm);

  const nightBase = Math.pow(1 - skyAmt, 1.0) * nightTwilightRelief;
  const dayBase = sunLow * dayTwilightRelief;

  const h = smoothstep(-0.05, 0.1, S.alt);
  let factor = (1 - h) * nightBase + h * dayBase;

  const seam = 1 - clamp01(Math.abs(S.alt) / 0.045);
  factor *= 1 + 0.12 * seam;

  const darknessAlpha = Math.max(0, Math.min(MAX_DARK, factor * MAX_DARK));
  if (darknessAlpha <= 0.002) return;

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.fillStyle = `rgba(0,0,0,${darknessAlpha})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}
