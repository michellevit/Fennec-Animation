// components/Animation/helpers/drawSky.ts
import { getDayState } from "./dayState";

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const mix = (a: number[], b: number[], t: number) => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];
const rgb = (c: number[]) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
const sm01 = (x: number, a: number, b: number) => clamp01((x - a) / (b - a));
const smez = (x: number, a: number, b: number) => {
  const t = sm01(x, a, b);
  return t * t * (3 - 2 * t);
};

let prevAlt: number | undefined;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function drawSky(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number
) {
  const { skyAmt, twilightWarm, sun, moon } = getDayState(canvas, currentTime);

  const dayTop = [90, 165, 235];
  const dayHzn = [170, 210, 245];
  const nightTop = [15, 25, 60];
  const nightHzn = [30, 40, 90];

  const warmTint = [255, 180, 110];
  const peach = [255, 165, 130];
  const rose = [252, 95, 160];
  const orange = [255, 120, 40];
  const red = [230, 60, 60];
  const violetTop = [120, 100, 210];
  const deepViolet = [75, 70, 150];

  let altRaw = Number.isFinite(sun?.alt)
    ? (sun!.alt as number)
    : prevAlt ?? 0.1;

  const MAX_DELTA = 0.12;
  if (prevAlt !== undefined) {
    const delta = altRaw - prevAlt;
    if (delta > MAX_DELTA) altRaw = prevAlt + MAX_DELTA;
    else if (delta < -MAX_DELTA) altRaw = prevAlt - MAX_DELTA;
  }

  const alt = prevAlt === undefined ? altRaw : lerp(prevAlt, altRaw, 0.35);
  prevAlt = alt;

  const moonUp = clamp01((moon?.easedAlt as number) ?? 0);
  const warmGate = 1 - smez(moonUp, 0.2, 0.35);

  const paletteMix = smez(alt, -0.05, 0.1);
  const topBase = mix(nightTop, dayTop, paletteMix);
  const baseBottom = mix(nightHzn, dayHzn, paletteMix);

  const nightKill = 1 - smez(moonUp, 0.7, 0.92);

  const sunsetAlt = alt < 0 ? 1 - smez(-alt, 0.02, 0.1) : 0;
  const sunsetMoon = 1 - smez(moonUp, 0.15, 0.35);
  const sunsetW0 = clamp01(sunsetAlt * sunsetMoon * nightKill * 1.5);
  const fastFade = Math.pow(1 - sm01(-alt, 0.015, 0.06), 2);
  const sunsetW = clamp01(sunsetW0 * fastFade);

  const sunriseW =
    alt >= -0.15 ? smez(alt, -0.15, 0.12) * (1 - smez(alt, 0.32, 0.55)) : 0;
  const sunriseWk = clamp01(sunriseW * nightKill * 1.1);

  const glowRaw = Math.max(sunriseWk, sunsetW);
  const seam = 1 - clamp01(Math.abs(alt) / 0.06);
  const postSunsetTrim = Math.pow(1 - sm01(-alt, 0.02, 0.08), 2);
  const glow = glowRaw * (1 - 0.28 * seam) * postSunsetTrim;

  const dayWarm = smez(alt, 0.04, 0.22);
  const warmStrength = clamp01(dayWarm + twilightWarm * 0.35 * warmGate);
  const warm = clamp01(0.45 * (warmStrength * nightKill) + 0.55 * glow);

  let bottom = mix(baseBottom, warmTint, 0.52 * warm + 0.24 * glow);
  const orangeAmt = (0.22 * sunriseWk + 0.28 * sunsetW) * warmGate;
  bottom = mix(bottom, orange, orangeAmt);
  bottom = mix(bottom, red, 0.22 * sunsetW);
  bottom = mix(bottom, peach, 0.08 * sunsetW);

  const rim = mix(orange, rose, 0.22 * sunsetW * warmGate);

  let top = mix(topBase, violetTop, 0.05 * sunriseWk + 0.16 * sunsetW);
  top = mix(top, deepViolet, 0.07 * sunsetW);

  const mid = mix(top, rim, 0.18 * sunsetW);
  const mid2 = mix(mid, bottom, 0.5 + 0.1 * glow);

  const sunsetLift = 0.04 * sunsetW;
  const midPos = clamp01(
    0.55 + 0.08 * (1 - paletteMix) - 0.08 * glow - sunsetLift
  );
  const hznPos = clamp01(
    0.8 + 0.05 * (1 - paletteMix) - 0.09 * glow - sunsetLift
  );
  const midPosL = clamp01(midPos - 0.03 * sunsetW);
  const hznPosL = clamp01(hznPos - 0.06 * sunsetW);

  const groundFrac = 0.25;
  const mapToSky = (p: number) => clamp01(p * (1 - groundFrac));

  const stops = [
    { p: mapToSky(0.0), c: rgb(top) },
    { p: mapToSky(midPosL), c: rgb(mid2) },
    { p: mapToSky(hznPosL), c: rgb(bottom) },
    { p: 1 - groundFrac, c: rgb(bottom) },
    { p: 1.0, c: rgb(bottom) },
  ].sort((a, b) => a.p - b.p);

  const EPS = 1e-4;
  for (let i = 1; i < stops.length; i++) {
    if (stops[i].p <= stops[i - 1].p) {
      stops[i].p = Math.min(1, stops[i - 1].p + EPS);
    }
  }

  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  stops.forEach((s) => g.addColorStop(s.p, s.c));

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
