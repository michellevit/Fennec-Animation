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
  const { sun: S, moon: M } = getDayState(canvas, currentTime);

  if (!S.visible && !M.visible) return; // <-- move guard to the top

  if (S.visible) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    if (sun) ctx.drawImage(sun, S.x - sun.width / 2, S.y - sun.height / 2);
    else {
      ctx.fillStyle = "rgba(255,220,120,0.95)";
      ctx.beginPath();
      ctx.arc(S.x, S.y, 50, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    if (moon) ctx.drawImage(moon, M.x - moon.width / 2, M.y - moon.height / 2);
    else {
      ctx.fillStyle = "rgba(210,230,255,0.95)";
      ctx.beginPath();
      ctx.arc(M.x, M.y, 50, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
