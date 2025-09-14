// components/Animation/helpers/drawStars.ts
import { getDayState } from "./dayState";
import { buildGroundTimeline } from "./buildGroundTimeline";

type ImgMap = Record<string, HTMLImageElement>;
type Star = {
  kind: "star";
  src: string;
  y: number;
  w: number;
  h: number;
  baseAlpha: number;
  alive: boolean;
  x: number;
  lastT: number;
  speed0: number;
  spawnAt: number;
  boostUntil: number;
  boostMul: number;
};

const STAR_SRC = "/parallax/star.png";
const STAR_SLOTS = 24;
const STAR_TARGET = 12;

const _tl = buildGroundTimeline();
const SCROLL_STOP_T = _tl.length
  ? _tl[_tl.length - 1].startTime
  : Number.POSITIVE_INFINITY;

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const hash01 = (n: number) => {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 0xffffffff;
};
const shuffle = (arr: number[]) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(hash01(12345 + i) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

let stars: Star[] = [];
let spawnOrder: number[] = [];
let spawnSeqU = 0.1379;
let visibleStarSlots = 0;
let nextStarAt = -1;
let wasDay: boolean | null = null;

function sampleYs(count: number, top: number, height: number) {
  const step = height / (count + 1);
  const jitter = step * 0.18;
  const ys: number[] = [];
  for (let i = 0; i < count; i++) {
    const u = (i + 1) / (count + 1);
    const j = hash01(1000 + i) * 2 - 1;
    ys.push(clamp(top + u * height + j * jitter, top, top + height));
  }
  return ys;
}

function ensureInit(canvas: HTMLCanvasElement, images: ImgMap) {
  const img = images[STAR_SRC];
  if (!img) return;
  if (stars.length !== STAR_SLOTS) {
    const H = canvas.height;
    const TOP = 4;
    const BAND = H * 0.3;
    const ys = sampleYs(STAR_SLOTS, TOP, BAND);
    const list: Star[] = [];
    for (let s = 0; s < STAR_SLOTS; s++) {
      const scale = 0.26 + hash01(3000 + s) * 0.28;
      const w = Math.max(2, img.width * scale);
      const h = Math.max(2, img.height * scale);
      const y = ys[s];
      const depth = clamp((y - TOP) / Math.max(1, BAND), 0, 1);
      const speed0 = 14 * (0.85 + 0.9 * depth) * (0.9 + 0.2 * hash01(7007 + s));
      list.push({
        kind: "star",
        src: STAR_SRC,
        y,
        w,
        h,
        baseAlpha: 1,
        alive: false,
        x: 0,
        lastT: 0,
        speed0,
        spawnAt: 0,
        boostUntil: 0,
        boostMul: 3,
      });
    }
    stars = list;
  }
  if (spawnOrder.length !== STAR_SLOTS) {
    spawnOrder = shuffle([...Array(STAR_SLOTS).keys()]);
  }
}

function nextSpawnU() {
  const phi = 0.6180339887498949;
  spawnSeqU = (spawnSeqU + phi) % 1;
  return spawnSeqU;
}

function activateStarSlot(
  slotIdx: number,
  t: number,
  canvas: HTMLCanvasElement
) {
  if (spawnOrder.length !== STAR_SLOTS) return;
  const W = canvas.width;
  const idx = spawnOrder[slotIdx % STAR_SLOTS];
  const it = stars[idx];
  if (!it) return;

  const span = W * 0.9;
  const u = nextSpawnU();
  const cell = span / STAR_SLOTS;
  const base = W + u * span;
  const jitter = (hash01(54321 + slotIdx) - 0.5) * cell * 0.1;

  it.alive = true;
  it.x = base + jitter;
  it.lastT = t;
  it.spawnAt = t;
  it.boostUntil = t + 0.2;
}

export function drawStars(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number,
  images: ImgMap
) {
  ensureInit(canvas, images);
  if (stars.length !== STAR_SLOTS || spawnOrder.length !== STAR_SLOTS) return;

  const { sun: S } = getDayState(canvas, currentTime);
  const isDay = !!S?.visible;
  const groundMoving = currentTime < SCROLL_STOP_T;

  if (wasDay === null) wasDay = isDay;

  if (wasDay && !isDay) {
    visibleStarSlots = 0;
    nextStarAt = groundMoving ? currentTime - 0.3 : -1;
  }
  if (!wasDay && isDay) {
    visibleStarSlots = 0;
    nextStarAt = -1;
    for (const it of stars) it.alive = false;
  }
  wasDay = isDay;

  const starOn = !isDay && groundMoving;

  if (starOn) {
    if (nextStarAt < 0) nextStarAt = currentTime - 0.2;
    const interval = 0.055;
    while (visibleStarSlots < STAR_TARGET && currentTime >= nextStarAt) {
      activateStarSlot(visibleStarSlots, currentTime, canvas);
      visibleStarSlots++;
      nextStarAt += interval;
    }
  } else {
    nextStarAt = -1;
  }

  for (const it of stars) {
    const img = images[it.src];
    if (!img || !it.alive) continue;

    const dt = Math.max(0, currentTime - it.lastT);
    it.lastT = currentTime;

    const v = starOn ? it.speed0 : 0;
    it.x -= v * dt;

    const W = canvas.width;
    const span = W + it.w;

    const wrapOn = starOn;
    if (wrapOn) {
      while (it.x < -it.w) it.x += span;
    } else if (it.x < -it.w) {
      it.alive = false;
      continue;
    }

    ctx.save();
    ctx.globalAlpha = it.baseAlpha;
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(img, Math.round(it.x), Math.round(it.y), it.w, it.h);
    if (wrapOn && it.x + it.w < W) {
      ctx.drawImage(img, Math.round(it.x + span), Math.round(it.y), it.w, it.h);
    }
    ctx.restore();
  }
}
