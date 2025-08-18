// components/Animation/helpers/drawGlobalLight.ts

import { getDayState } from "./dayState";

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function drawGlobalLight(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number
) {
  const { skyAmt, twilightWarm, sun: S } = getDayState(canvas, currentTime);

  const MAX_DARK = 0.55;
  const START_DIM_ALT = 0.35;
  const FULL_DIM_ALT = 0.12;

  const sunLow = 1 - smoothstep(FULL_DIM_ALT, START_DIM_ALT, S.easedAlt);
  const afterOrange = 1 - Math.min(1, twilightWarm);

  let factor: number;
  if (S.visible) {
    factor = sunLow * afterOrange;
  } else {
    factor = Math.pow(1 - skyAmt, 1.0); // no moon lift
  }

  const darknessAlpha = Math.max(0, Math.min(MAX_DARK, factor * MAX_DARK));
  if (darknessAlpha <= 0.002) return;

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.fillStyle = `rgba(0,0,0,${darknessAlpha})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}
