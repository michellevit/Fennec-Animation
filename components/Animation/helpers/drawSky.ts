export function drawSky(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) {
  ctx.fillStyle = "#87CEEB"; // light blue
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
