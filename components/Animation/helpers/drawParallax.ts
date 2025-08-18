// components/Animation/helpers/drawParallax.ts
import { getDayState } from "./dayState";
import { buildGroundTimeline } from "./buildGroundTimeline";

type ImgMap = Record<string, HTMLImageElement>;
type Kind = "cloud" | "star";
type Instance = {
  kind: Kind;
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
  lane?: number;
  laneSlot?: number;
  starSlot?: number;
};

const STAR_SRC = "/parallax/star.png";
const CLOUD_SRC = "/parallax/cloud.png";

const STAR_SLOTS = 15;
const STAR_TARGET = 15;
const STAR_ORDER_STEP = 7; // coprime with 15 → spreads first spawns

const CLOUD_LANES = 3;
const CLOUD_SLOTS_PER_LANE = 2;
const CLOUD_COUNT = CLOUD_LANES * CLOUD_SLOTS_PER_LANE;

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(1337);
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const smooth01 = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

let instances: Instance[] | null = null;
let wasDay: boolean | null = null;
let nightPhase = false;
let cloudActivated = false;
let visibleStarSlots = 0;
let nextStarAt = -1;

const _tl = buildGroundTimeline();
const SCROLL_STOP_T = _tl.length
  ? _tl[_tl.length - 1].startTime
  : Number.POSITIVE_INFINITY;

function initParallax(canvas: HTMLCanvasElement, images: ImgMap) {
  if (instances) return;
  const starImg = images[STAR_SRC];
  const cloudImg = images[CLOUD_SRC];
  if (!starImg || !cloudImg) return;

  const W = canvas.width,
    H = canvas.height;
  const list: Instance[] = [];

  // Stars: keep high in sky (top ~35%), pre-slot rows, small jitter
  const STAR_ROWS = 6;
  const STAR_TOP = 10;
  const STAR_BAND = H * 0.35;
  const rowStep = STAR_BAND / (STAR_ROWS + 1);
  const rowCenters = Array.from(
    { length: STAR_ROWS },
    (_, k) => STAR_TOP + rowStep * (k + 1)
  );

  for (let s = 0; s < STAR_SLOTS; s++) {
    const scale = 0.5 + rng() * 0.8;
    const w = Math.max(6, starImg.width * scale);
    const h = Math.max(6, starImg.height * scale);
    const row = s % STAR_ROWS;
    const y = rowCenters[row] + (rng() - 0.5) * rowStep * 0.2;
    const speed0 = 10;
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
      boostMul: 3.0,
      starSlot: s,
    });
  }

  // Clouds: slightly wider size range
  const bandTop = 40,
    bandH = H * 0.4;
  const laneStep = bandH / (CLOUD_LANES + 1);
  const laneCenters = Array.from(
    { length: CLOUD_LANES },
    (_, k) => bandTop + laneStep * (k + 1)
  );
  const laneSpeeds = [26, 32, 38];

  for (let lane = 0; lane < CLOUD_LANES; lane++) {
    for (let slot = 0; slot < CLOUD_SLOTS_PER_LANE; slot++) {
      const s = 0.65 + rng() * 0.9; // 0.65–1.55 (a touch more variance)
      const w = cloudImg.width * s;
      const h = cloudImg.height * s;
      const y = laneCenters[lane] + (rng() - 0.5) * laneStep * 0.25;
      list.push({
        kind: "cloud",
        src: CLOUD_SRC,
        y,
        w,
        h,
        baseAlpha: 1,
        alive: false,
        x: 0,
        lastT: 0,
        speed0: laneSpeeds[lane],
        spawnAt: 0,
        boostUntil: 0,
        boostMul: 1,
        lane,
        laneSlot: slot,
      });
    }
  }

  instances = list;
}

function placeCloudsEven(t: number, canvas: HTMLCanvasElement) {
  if (!instances) return;
  const clouds = instances.filter((i) => i.kind === "cloud");
  if (!clouds.length) return;
  const W = canvas.width;
  const span = W * 2.2;
  for (let k = 0; k < clouds.length; k++) {
    const it = clouds[k];
    it.alive = true;
    const base = W + (k / clouds.length) * span;
    const jitter = (rng() - 0.5) * 40;
    it.x = base + jitter;
    it.lastT = t;
    it.spawnAt = t;
    it.boostUntil = t;
  }
}

// Even horizontal order (coprime jump), tight span, tiny jitter
function activateStarSlot(
  slotIdx: number,
  t: number,
  canvas: HTMLCanvasElement
) {
  if (!instances) return;
  const W = canvas.width;
  const id = (slotIdx * STAR_ORDER_STEP) % STAR_SLOTS;
  const it = instances.find((i) => i.kind === "star" && i.starSlot === id);
  if (!it) return;
  const span = W * 0.95;
  const frac = id / Math.max(1, STAR_SLOTS - 1);
  const base = W + frac * span;
  const jitter = (rng() - 0.5) * 16;
  it.alive = true;
  it.x = base + jitter;
  it.lastT = t;
  it.spawnAt = t;
  it.boostUntil = t + 0.9;
}

export function drawParallax(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number,
  images: ImgMap
) {
  if (!instances) initParallax(canvas, images);
  if (!instances) return;

  const { sun: S, moon: M } = getDayState(canvas, currentTime);
  const isDay = !!S?.visible;

  if (wasDay === null) wasDay = isDay;
  if (wasDay && !isDay) {
    nightPhase = true;
    visibleStarSlots = 0;
    nextStarAt = -1;
  }
  if (!wasDay && isDay) {
    nightPhase = false;
    visibleStarSlots = 0;
    nextStarAt = -1;
    cloudActivated = false;
    for (const it of instances) if (it.kind === "star") it.alive = false;
  }
  wasDay = isDay;

  const W = canvas.width;
  const groundMoving = currentTime < SCROLL_STOP_T;

  // Clouds: day only
  const cloudWrapOn = isDay;
  const cloudGateOn = isDay && (S?.easedAlt ?? 0) >= 0.35;
  if (cloudGateOn && !cloudActivated) {
    placeCloudsEven(currentTime, canvas);
    cloudActivated = true;
  }

  // Stars: start when sun is in bottom 1/4 or gone; spawn at a cadence
  const sunBelowQuarter = !isDay || (!!S && S.y >= canvas.height * 0.75);
  const starWrapOn = nightPhase;
  const nightProgress = clamp(M?.easedAlt ?? 0, 0, 1);
  if (nightPhase && sunBelowQuarter) {
    if (nextStarAt < 0) nextStarAt = currentTime; // start cadence
    const interval = lerp(0.18, 0.55, nightProgress); // faster early → slower later
    while (visibleStarSlots < STAR_TARGET && currentTime >= nextStarAt) {
      activateStarSlot(visibleStarSlots, currentTime, canvas);
      visibleStarSlots++;
      nextStarAt += interval;
    }
  } else {
    nextStarAt = -1;
    for (const it of instances) if (it.kind === "star") it.alive = false;
  }

  for (const it of instances) {
    const img = images[it.src];
    if (!img || !it.alive) continue;

    const dt = Math.max(0, currentTime - it.lastT);
    it.lastT = currentTime;

    let v = it.speed0;
    if (it.kind === "star")
      v = groundMoving ? v * lerp(3.0, 0.9, nightProgress) : 0;
    if (currentTime < it.boostUntil) {
      const t = clamp(
        (currentTime - it.spawnAt) / (it.boostUntil - it.spawnAt || 1),
        0,
        1
      );
      v *= it.boostMul * (1 - smooth01(t)) + 1 * smooth01(t);
    }

    it.x -= v * dt;

    const span = W + it.w;
    const wrapOn = it.kind === "cloud" ? cloudWrapOn : starWrapOn;
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
