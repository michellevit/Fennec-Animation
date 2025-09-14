// components/Animation/helpers/drawParallax.ts
import { getDayState } from "./dayState";
import { buildGroundTimeline } from "./buildGroundTimeline";
import { drawClouds } from "./drawClouds";
import { drawStars } from "./drawStars";

type ImgMap = Record<string, HTMLImageElement>;

const _tl = buildGroundTimeline();
const SCROLL_STOP_T = _tl.length
  ? _tl[_tl.length - 1].startTime
  : Number.POSITIVE_INFINITY;

export function drawParallax(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number,
  images: ImgMap
) {
  getDayState(canvas, currentTime);
  const groundMoving = currentTime < SCROLL_STOP_T;
  drawClouds(ctx, canvas, currentTime, images);
  drawStars(ctx, canvas, currentTime, images);
}
