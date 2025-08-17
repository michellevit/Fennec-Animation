import { getDayState } from "./dayState";
type ImgMap = Record<string, HTMLImageElement>;

export function drawCelestials(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number,
  images: ImgMap
) {
  const sun = images["/elements/sun.png"];
  const moon = images["/elements/moon.png"];
  if (!sun || !moon) return;

  const { sun: S, moon: M } = getDayState(canvas, currentTime);

  ctx.save();
  // draw sun first, then moon (order doesn’t matter much behind ground)
  if (S.visible) ctx.drawImage(sun, S.x - sun.width / 2, S.y - sun.height / 2);
  if (M.visible)
    ctx.drawImage(moon, M.x - moon.width / 2, M.y - moon.height / 2);
  ctx.restore();
}
