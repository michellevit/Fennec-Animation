export function drawSky(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number
) {
  const duration = 90; // total animation duration (seconds)
  const half = duration / 2;

  // Cycle between 0 → 1 → 0
  const t = (currentTime % duration) / half;
  const brightness = t <= 1 ? t : 2 - t;

  // Interpolate from light blue to midnight blue
  const lerp = (start: number, end: number, amt: number) =>
    Math.round(start + (end - start) * amt);

  const r = lerp(135, 25, brightness);
  const g = lerp(206, 25, brightness);
  const b = lerp(235, 112, brightness);

  const skyColor = `rgb(${r}, ${g}, ${b})`;
  ctx.fillStyle = skyColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
