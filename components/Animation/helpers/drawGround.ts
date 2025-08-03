import { buildGroundTimeline } from "./buildGroundTimeline";

const timeline = buildGroundTimeline();
const norm = (p: string) => (p.startsWith("/") ? p : "/" + p);

export function drawGround(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number,
  images: Record<string, HTMLImageElement>
) {
  const currentIndex = timeline.findIndex(
    (segment) =>
      currentTime >= segment.startTime && currentTime < segment.endTime
  );

  if (currentIndex === -1) {
    const fallback =
      currentTime < (timeline[0]?.startTime ?? 0)
        ? timeline[0]
        : timeline.at(-1)!;
    const img = images[norm(fallback.imagePath)]; // normalize here too
    if (img) {
      const y = canvas.height - img.height;
      ctx.drawImage(img, 0, y);
    }
    return;
  }

  const currentSegment = timeline[currentIndex];
  const nextSegment = timeline[currentIndex + 1];

  const currentImg = images[norm(currentSegment.imagePath)];
  if (!currentImg) return;

  // --- LAST SEGMENT: hold the final tile still (no scroll) ---
  if (!nextSegment) {
    const y = canvas.height - currentImg.height;
    ctx.drawImage(currentImg, 0, y);
    return;
  }
  // -----------------------------------------------------------

  const progress =
    (currentTime - currentSegment.startTime) /
    (currentSegment.endTime - currentSegment.startTime);

  // No-gap fallback: if next image missing, reuse current
  const nextImg: HTMLImageElement =
    images[norm(nextSegment.imagePath)] ?? currentImg;

  const scrollDistance = canvas.width;
  const offset = scrollDistance * Math.min(Math.max(progress, 0), 1);
  const y = canvas.height - currentImg.height;

  ctx.drawImage(currentImg, -offset, y);
  ctx.drawImage(nextImg, scrollDistance - offset, y);
}
