// components/Animation/helpers/drawClouds.ts
import { getDayState } from "./dayState";

type ImgMap = Record<string, HTMLImageElement>;
type Cloud = {
  kind: "cloud";
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
  orderIdx: number;
};

const CLOUD_SRC = "/parallax/cloud.png";
const TOTAL_CLOUDS = 10;
const CLOUD_CAP = 3;

const rng = (() => {
  let seed = 1337 >>> 0;
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const smooth01 = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
const hash01 = (n: number) => {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 0xffffffff;
};

let clouds: Cloud[] | null = null;
let cloudActivated = false;
let wasDay: boolean | null = null;
let maxSunUp = 0;
let isSunSetting = false;
let lastSunYFrac: number | null = null;
let lastCloudGateOn = false;

function sampleCloudYs(count: number, top: number, height: number) {
  const ys: number[] = [];
  const step = height / (count + 1);
  const jitter = step * 0.18;
  for (let i = 0; i < count; i++) {
    const base = top + step * (i + 1);
    const j = hash01(1000 + i) * 2 - 1; // [-1,1]
    ys.push(clamp(base + j * jitter, top, top + height));
  }
  return ys;
}

function initClouds(canvas: HTMLCanvasElement, images: ImgMap) {
  if (clouds) return;
  const img = images[CLOUD_SRC];
  if (!img) return;

  const H = canvas.height;
  const bandTop = Math.round(H * 0.04);
  const bandH = Math.round(H * 0.36);
  const ys = sampleCloudYs(TOTAL_CLOUDS, bandTop, bandH);

  const list: Cloud[] = [];
  for (let i = 0; i < ys.length; i++) {
    const s = 0.55 + rng() * 1.1;
    const w = img.width * s;
    const h = img.height * s;

    const baseSpeed = 28 + rng() * 16;
    const sizeFactor = 1.0 - (Math.min(1.65, Math.max(0.55, s)) - 0.55) * 0.08;
    const speed0 = baseSpeed * sizeFactor;

    list.push({
      kind: "cloud",
      src: CLOUD_SRC,
      y: ys[i],
      w,
      h,
      baseAlpha: 1,
      alive: false,
      x: 0,
      lastT: 0,
      speed0,
      spawnAt: 0,
      boostUntil: 0,
      boostMul: 1,
      orderIdx: i,
    });
  }
  clouds = list;
}

function placeCloudsEven(t: number, canvas: HTMLCanvasElement) {
  if (!clouds) return;
  const W = canvas.width;
  const span = W * 2.3;
  const phi = 0.61803398875;
  for (let k = 0; k < clouds.length; k++) {
    const it = clouds[k];
    it.alive = true;
    const frac = ((k + 0.5) * phi) % 1;
    const base = W + frac * span;
    const jitter = (rng() - 0.5) * 10;
    it.x = base + jitter;
    it.lastT = t;
    it.spawnAt = t;
    it.boostUntil = t;
  }
}

export function drawClouds(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number,
  images: ImgMap
) {
  initClouds(canvas, images);
  if (!clouds) return;

  const { sun: S } = getDayState(canvas, currentTime);
  const isDay = !!S?.visible;

  if (wasDay === null) wasDay = isDay;
  if (wasDay && !isDay) {
    cloudActivated = false;
    maxSunUp = 0;
    isSunSetting = false;
    lastSunYFrac = null;
    lastCloudGateOn = false;
  }
  if (!wasDay && isDay) {
    cloudActivated = false;
    for (const it of clouds) it.alive = false;
    maxSunUp = 0;
    isSunSetting = false;
    lastSunYFrac = null;
    lastCloudGateOn = false;
  }
  wasDay = isDay;

  const W = canvas.width;
  const H = canvas.height;

  const sunUp = clamp(S?.easedAlt ?? 0, 0, 1);
  const sunYFrac = S ? S.y / H : 1;

  if (isDay) {
    if (sunUp > maxSunUp) maxSunUp = sunUp;
    else if (sunUp < maxSunUp - 0.001) isSunSetting = true;
  } else {
    maxSunUp = 0;
    isSunSetting = false;
  }

  const rising = lastSunYFrac !== null ? sunYFrac < lastSunYFrac : false;
  lastSunYFrac = sunYFrac;

  const allowByPosition = sunYFrac <= 0.4;
  const spawnGate = isDay && rising && allowByPosition && !isSunSetting;

  const eAlt = S?.easedAlt ?? 0;
  const HOLD = 0.36;
  const LINGER = 0.3;

  const lingerFactor =
    eAlt > HOLD ? 1 : smooth01((eAlt - LINGER) / (HOLD - LINGER));
  const cloudWrapOnBase = spawnGate || eAlt > LINGER;
  const cloudGateOn = cloudWrapOnBase;

  if (cloudGateOn && !cloudActivated) {
    placeCloudsEven(currentTime, canvas);
    cloudActivated = true;
  }

  if (!cloudGateOn && lastCloudGateOn) {
    for (const it of clouds) if (it.alive && it.x > W - 1) it.alive = false;
  }
  lastCloudGateOn = cloudGateOn;

  const phase = clamp((0.5 - sunYFrac) / 0.5, 0, 1);
  const thinning = clamp(1 - phase, 0, 1);
  const wrapAllowed = Math.min(
    CLOUD_CAP,
    Math.max(
      0,
      Math.ceil(TOTAL_CLOUDS * thinning * Math.pow(lingerFactor, 1.2))
    )
  );

  const shouldWrap = (it: Cloud) =>
    cloudWrapOnBase && it.orderIdx < wrapAllowed;

  for (const it of clouds) {
    const img = images[it.src];
    if (!img || !it.alive) continue;

    const dt = Math.max(0, currentTime - it.lastT);
    it.lastT = currentTime;

    const v = it.speed0 * (eAlt <= LINGER ? 1.8 : 1.0);
    it.x -= v * dt;

    const span = W + it.w;
    const wrapOn = shouldWrap(it);

    if (wrapOn) {
      while (it.x < -it.w) it.x += span;
    } else if (it.x < -it.w) {
      it.alive = false;
      continue;
    }

    ctx.save();
    ctx.globalAlpha = it.baseAlpha;
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(img, Math.round(it.x), Math.round(it.y), it.w, it.h);
    if (wrapOn && it.x + it.w < W)
      ctx.drawImage(img, Math.round(it.x + span), Math.round(it.y), it.w, it.h);
    ctx.restore();
  }
}
