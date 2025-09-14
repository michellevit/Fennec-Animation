import { buildGroundTimeline } from "./buildGroundTimeline";

const norm = (p: string) => (p.startsWith("/") ? p : "/" + p);

let cacheKey: number | null = null;
let cachedTimeline: ReturnType<typeof buildGroundTimeline> = [];

function getTimeline(trackDurationSec?: number) {
  const key =
    Number.isFinite(trackDurationSec as number) &&
    (trackDurationSec as number) > 0
      ? (trackDurationSec as number)
      : -1;
  if (cacheKey !== key) {
    cachedTimeline = buildGroundTimeline(trackDurationSec);
    cacheKey = key;
  }
  return cachedTimeline;
}

export function drawGround(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number,
  images: Record<string, HTMLImageElement>,
  trackDurationSec?: number
) {
  const timeline = getTimeline(trackDurationSec);
  if (!timeline.length) return;

  const idx = timeline.findIndex(
    (seg) => currentTime >= seg.startTime && currentTime < seg.endTime
  );

  if (idx === -1) {
    const first = timeline[0];
    const last = timeline[timeline.length - 1];
    const fallback = currentTime < (first?.startTime ?? 0) ? first : last;
    if (!fallback) return;
    const img = images[norm(fallback.imagePath)];
    if (!img) return;
    const y = canvas.height - img.height;
    ctx.drawImage(img, 0, y);
    return;
  }

  const current = timeline[idx];
  const next = timeline[idx + 1];

  const currentImg = images[norm(current.imagePath)];
  if (!currentImg) return;

  if (!next) {
    const y = canvas.height - currentImg.height;
    ctx.drawImage(currentImg, 0, y);
    return;
  }

  const segLen = Math.max(1e-6, next.startTime - current.startTime);
  const progress = Math.max(
    0,
    Math.min(1, (currentTime - current.startTime) / segLen)
  );

  const nextImg = images[norm(next.imagePath)] ?? currentImg;

  const scrollDistance = canvas.width;
  const offset = scrollDistance * progress;
  const y = canvas.height - currentImg.height;

  ctx.drawImage(currentImg, -offset, y);
  ctx.drawImage(nextImg, scrollDistance - offset, y);
}
