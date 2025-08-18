import { buildGroundTimeline } from "./buildGroundTimeline";
type ImgMap = Record<string, HTMLImageElement>;

const timeline = buildGroundTimeline();
const norm = (p: string) => (p.startsWith("/") ? p : "/" + p);

// Tunables
const HOLE_PATH = "/elements/hole.png";
const HOLE_SIZE = 100;
const HOLE_Y_PAD = 275;

export function drawHole(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number,
  images: ImgMap
) {
  const hole = images[HOLE_PATH];
  if (!hole || !timeline.length) return;

  // Which ground segment are we in?
  let i = timeline.findIndex(
    (s) => currentTime >= s.startTime && currentTime < s.endTime
  );

  // === Fallback like drawGround ===
  if (i === -1) {
    // before the first segment -> don't show the hole yet
    if (currentTime < timeline[0].startTime) return;

    // after the last segment -> lock to final tile at x=0
    const lastSeg = timeline[timeline.length - 1];
    const lastImg = images[norm(lastSeg.imagePath)];
    if (!lastImg) return;

    const yTop = canvas.height - lastImg.height;
    const xHole = (canvas.width - HOLE_SIZE) / 2;
    const yHole = yTop + HOLE_Y_PAD;
    ctx.drawImage(hole, xHole, yHole, HOLE_SIZE, HOLE_SIZE);
    return;
  }

  const lastIndex = timeline.length - 1;
  const currSeg = timeline[i];
  const currImg = images[norm(currSeg.imagePath)];
  if (!currImg) return;

  // Ground Y for current/next tiles
  const yCurrTop = canvas.height - currImg.height;
  const nextSeg = i < lastIndex ? timeline[i + 1] : undefined;
  const nextImg = nextSeg ? images[norm(nextSeg.imagePath)] : undefined;
  const yNextTop = nextImg ? canvas.height - nextImg.height : yCurrTop;

  // Horizontal center of a tile (your tiles span the canvas width)
  const holeXInTile = (canvas.width - HOLE_SIZE) / 2;

  // CASE 1: second-to-last segment → final tile scrolls in from the right
  if (i === lastIndex - 1 && nextSeg) {
    const progress = Math.min(
      1,
      Math.max(
        0,
        (currentTime - currSeg.startTime) /
          (currSeg.endTime - currSeg.startTime)
      )
    );
    const scrollDistance = canvas.width;
    const offset = scrollDistance * progress;

    const xNextTile = scrollDistance - offset; // matches drawGround for "next"
    const xHole = xNextTile + holeXInTile;
    const yHole = yNextTop + HOLE_Y_PAD;

    ctx.drawImage(hole, xHole, yHole, HOLE_SIZE, HOLE_SIZE);
    return;
  }

  // CASE 2: last segment → final tile is static at x = 0
  if (i === lastIndex && !nextSeg) {
    const xHole = holeXInTile;
    const yHole = yCurrTop + HOLE_Y_PAD;
    ctx.drawImage(hole, xHole, yHole, HOLE_SIZE, HOLE_SIZE);
    return;
  }

  // Other segments: no hole (only appears with final tile)
}
