import {
  spriteFrames,
  spriteFrameRate,
  spriteAppearance,
  SPRITE_ANIMATION_DURATION,
  spritePhaseTimings,
} from "../config/spriteConfig";

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number,
  images: Record<string, HTMLImageElement>
) {
  let frameSrc = "";

  if (currentTime < spritePhaseTimings.run.start) {
    const phaseProgress =
      (currentTime - spritePhaseTimings.start.start) /
      (spritePhaseTimings.start.end - spritePhaseTimings.start.start);
    const frameIndex = Math.floor(phaseProgress * spriteFrames.start.length);
    frameSrc = spriteFrames.start[frameIndex] ?? spriteFrames.start.at(-1)!;
  } else if (currentTime < spritePhaseTimings.jump.start) {
    const runTime = currentTime - spritePhaseTimings.run.start;
    const index =
      Math.floor(runTime * spriteFrameRate.run) % spriteFrames.run.length;
    frameSrc = spriteFrames.run[index];
  } else {
    const jumpTime = currentTime - spritePhaseTimings.jump.start;
    const index = Math.min(
      Math.floor(jumpTime * spriteFrameRate.jump),
      spriteFrames.jump.length - 1
    );
    frameSrc = spriteFrames.jump[index];
  }

  const spriteImg = images[frameSrc];
  if (spriteImg) {
    const { scale, offsetX, offsetY } = spriteAppearance;
    const spriteWidth = spriteImg.width * scale;
    const spriteHeight = spriteImg.height * scale;
    const x = (canvas.width - spriteWidth) / 2 + offsetX;
    const y = canvas.height - spriteHeight - canvas.height * offsetY;

    ctx.drawImage(spriteImg, x, y, spriteWidth, spriteHeight);
  }
}
