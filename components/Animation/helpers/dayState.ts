// components/Animation/helpers/dayState.ts
export type DayState = {
  isDay: boolean;
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
  skyAmt: number;
  twilightWarm: number; // dusk-only warmth
};

export const DURATION = 90;

const SUN = { start: 0.0, end: 0.64 };
const MOON = { start: 0.64, end: 1.0 };
const TWILIGHT_TAIL = 0.08;

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const remap01 = (x: number, a: number, b: number) =>
  clamp((x - a) / (b - a), 0, 1);
const smooth = (t: number) => t * t * (3 - 2 * t);

export function getDayState(
  canvas: HTMLCanvasElement,
  currentTime: number
): DayState {
  const phi = (currentTime % DURATION) / DURATION;

  const uSun = remap01(phi, SUN.start, SUN.end);
  const sunAlt = uSun > 0 && uSun < 1 ? Math.sin(Math.PI * uSun) : 0;
  const sunE = smooth(sunAlt);

  const uMoon = remap01(phi, MOON.start, MOON.end);
  const riseU = clamp(uMoon / 0.6, 0, 1);
  const moonAltRaw = riseU > 0 ? Math.sin((Math.PI / 2) * riseU) : 0;

  const isDay = sunAlt > 0.002;
  const sunVisible = isDay;
  const moonVisible = !isDay && moonAltRaw > 0.002;
  const moonAlt = moonVisible ? moonAltRaw : 0;
  const moonE = smooth(moonAlt);

  const SUN_X = canvas.width * 0.76;
  const MOON_X = canvas.width * 0.24;
  const TOP_Y = 80,
    BOTTOM_Y = canvas.height * 0.78;

  const sunY = BOTTOM_Y + (TOP_Y - BOTTOM_Y) * sunE;
  const moonY = BOTTOM_Y + (TOP_Y - BOTTOM_Y) * moonE;

  const FLOOR = 0.12;
  const CEIL = 1.0;
  const MIN_DAY = 0.6;

  let skyAmt = FLOOR;
  if (sunVisible) {
    const dayBase = FLOOR + (CEIL - FLOOR) * Math.pow(sunAlt, 0.9);
    skyAmt = Math.max(MIN_DAY, dayBase);
  } else {
    let dusk = 0;
    if (phi >= SUN.end && phi < SUN.end + TWILIGHT_TAIL) {
      dusk = 1 - remap01(phi, SUN.end, SUN.end + TWILIGHT_TAIL);
    }
    const dawnStart = (SUN.start - TWILIGHT_TAIL + 1) % 1;
    let dawn = 0;
    if (dawnStart < SUN.start) {
      if (phi >= dawnStart && phi < SUN.start)
        dawn = remap01(phi, dawnStart, SUN.start);
    } else {
      if (phi >= dawnStart || phi < SUN.start) {
        const t =
          phi >= dawnStart
            ? remap01(phi, dawnStart, 1)
            : remap01(phi, 0, SUN.start);
        dawn = t;
      }
    }
    const twilight = Math.max(dusk, dawn);
    const nightBase = FLOOR + 0.45 * twilight; // no moonLift
    skyAmt = clamp(nightBase, FLOOR, 0.85);
  }

  let twilightWarm = 0;
  if (sunVisible) {
    twilightWarm = Math.exp(-Math.pow((sunAlt - 0.18) / 0.22, 2));
  } else {
    if (phi >= SUN.end && phi < SUN.end + TWILIGHT_TAIL) {
      twilightWarm = 1 - remap01(phi, SUN.end, SUN.end + TWILIGHT_TAIL);
    }
  }

  return {
    isDay,
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
    twilightWarm: clamp(twilightWarm, 0, 1),
  };
}
