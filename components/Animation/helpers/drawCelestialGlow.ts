import { getDayState } from "./dayState";

export function drawCelestialGlow(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number
) {
  const { sun: S, moon: M, skyAmt } = getDayState(canvas, currentTime);

  const BLUR = 6,
    INNER = 24,
    OUTER = 170;

  const drawGlow = (
    x: number,
    y: number,
    kind: "sun" | "moon",
    strength: number
  ) => {
    if (strength <= 0.001) return;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.filter = `blur(${BLUR}px)`;
    ctx.globalAlpha = strength;

    const g = ctx.createRadialGradient(x, y, INNER, x, y, OUTER);
    if (kind === "sun") {
      g.addColorStop(0.0, "rgba(255,240,200,0.50)");
      g.addColorStop(0.18, "rgba(255,225,160,0.24)");
      g.addColorStop(0.4, "rgba(255,210,120,0.12)");
      g.addColorStop(0.7, "rgba(255,200,100,0.05)");
      g.addColorStop(1.0, "rgba(255,200,100,0.00)");
    } else {
      g.addColorStop(0.0, "rgba(210,230,255,0.36)");
      g.addColorStop(0.22, "rgba(200,220,255,0.20)");
      g.addColorStop(0.45, "rgba(190,210,255,0.09)");
      g.addColorStop(0.75, "rgba(190,210,255,0.03)");
      g.addColorStop(1.0, "rgba(190,210,255,0.00)");
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, OUTER, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Strengths: sun strongest when high; moon strongest when sky is dark
  if (S.visible) drawGlow(S.x, S.y, "sun", 0.48 * (0.6 + 0.4 * S.easedAlt));
  if (M.visible) drawGlow(M.x, M.y, "moon", 0.52 * (1.0 - skyAmt));
}
