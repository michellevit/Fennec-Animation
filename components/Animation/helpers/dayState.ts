// components/Animation/helpers/dayState.ts
export type DayState = {
  sun: {
    visible: boolean;
    alt: number;
    easedAlt: number;
    x: number;
    y: number;
  };
  moon: {
    visible: boolean;
    alt: number;
    easedAlt: number;
    x: number;
    y: number;
  };
  skyAmt: number; // 0..1 overall brightness (drives sky & global dim)
  twilight: number; // 0..1 warmth near horizon (peaks when sun near horizon)
};

export const DURATION = 90;

// Windows (fractions of 0..1 timeline). Tweak to taste.
const SUN = { start: 0.0, end: 0.62 }; // sunrise → set (steady)
const MOON = { start: 0.56, end: 1.0 }; // overlaps sunset; peaks at end

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const remap01 = (x: number, a: number, b: number) =>
  clamp((x - a) / (b - a), 0, 1);
const smooth = (t: number) => t * t * (3 - 2 * t); // smoothstep-like
const easeOutSine = (t: number) => Math.sin((Math.PI / 2) * clamp(t, 0, 1));

export function getDayState(
  canvas: HTMLCanvasElement,
  currentTime: number
): DayState {
  const phi = (currentTime % DURATION) / DURATION; // 0..1

  // Sun: half-sine bell in its window (0 at edges, 1 at mid) → realistic rise+set
  const uSun = remap01(phi, SUN.start, SUN.end);
  const sunHalfSine = Math.sin(Math.PI * uSun); // 0→1→0
  const sunAlt = uSun > 0 && uSun < 1 ? sunHalfSine : 0; // strictly 0 outside
  const sunE = smooth(sunAlt);

  // Moon: easeOut to TOP by the end (0→1). Peaks *at* t = DURATION.
  const uMoon = remap01(phi, MOON.start, MOON.end);
  const moonAlt = uMoon > 0 ? easeOutSine(uMoon) : 0; // 0 at start, 1 at end
  const moonE = smooth(moonAlt);

  // Visibility threshold so nothing “sticks” on the horizon
  const V = 0.01;
  const sunVisible = sunAlt > V;
  const moonVisible = moonAlt > V;

  // Positions: fixed X (skybox vibe), vertical only
  const SUN_X = canvas.width * 0.78;
  const MOON_X = canvas.width * 0.22;
  const TOP_Y = 80;
  const BOTTOM_Y = canvas.height * 0.78;

  const sunY = BOTTOM_Y + (TOP_Y - BOTTOM_Y) * sunE;
  const moonY = BOTTOM_Y + (TOP_Y - BOTTOM_Y) * moonE;

  // Global brightness: mostly from sun, a little from the moon
  const FLOOR = 0.1; // darkest ambient
  const DAY_K = 0.9; // daylight contribution
  const MOON_K = 0.25; // moon contribution (subtle)
  const skyAmt = clamp(
    FLOOR + DAY_K * Math.pow(sunAlt, 0.9) + MOON_K * Math.pow(moonAlt, 1.2),
    0,
    1
  );

  // Twilight warmth: strongest when sun is near horizon (alt small but visible)
  // Peaks around alt ≈ 0.2 and fades when sun is high or fully gone.
  const nearHorizon = sunVisible
    ? Math.exp(-Math.pow((sunAlt - 0.2) / 0.22, 2))
    : 0;
  const twilight = clamp(nearHorizon, 0, 1);

  return {
    sun: {
      visible: sunVisible,
      alt: sunAlt,
      easedAlt: sunE,
      x: SUN_X,
      y: sunY,
    },
    moon: {
      visible: moonVisible,
      alt: moonAlt,
      easedAlt: moonE,
      x: MOON_X,
      y: moonY,
    },
    skyAmt,
    twilight,
  };
}
