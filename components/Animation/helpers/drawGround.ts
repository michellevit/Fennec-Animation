import { groundTimeline } from "../config/groundConfig";
import { spritePhaseTimings } from "../config/spriteConfig";

const DEFAULT_SCROLL_SCREENS = 1;
const TRANSITION_SCROLL_SCREENS = 2;

export function drawGround(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currentTime: number,
  images: Record<string, HTMLImageElement>
) {
  const isRunning =
    currentTime >= spritePhaseTimings.run.start + 0.05 &&
    currentTime < spritePhaseTimings.run.end;

  let timeCursor = 0;
  let activeSegmentIndex = -1;
  let activeSegment;

  for (let i = 0; i < groundTimeline.length; i++) {
    const segment = groundTimeline[i];
    if (
      currentTime >= timeCursor &&
      currentTime < timeCursor + segment.duration
    ) {
      activeSegmentIndex = i;
      activeSegment = { ...segment, startTime: timeCursor };
      break;
    }
    timeCursor += segment.duration;
  }

  if (!activeSegment) return;

  const segmentElapsed = currentTime - activeSegment.startTime;
  const isTransition = activeSegment.frames.length === 1;
  const scrollScreens = isTransition
    ? TRANSITION_SCROLL_SCREENS
    : DEFAULT_SCROLL_SCREENS;
  const totalScrollDistance = canvas.width * scrollScreens;
  const scrollSpeed = totalScrollDistance / activeSegment.duration;
  const easingDuration = 2;
  const easedElapsed =
    segmentElapsed < easingDuration
      ? segmentElapsed ** 3 / easingDuration ** 2
      : segmentElapsed - easingDuration / 2;
  const scrollOffset = isRunning ? easedElapsed * scrollSpeed : 0;
  const groundY =
    canvas.height - (images[activeSegment.frames[0]]?.height || 0);

  if (
    isTransition &&
    activeSegmentIndex > 0 &&
    activeSegmentIndex < groundTimeline.length - 1
  ) {
    const previousSegment = groundTimeline[activeSegmentIndex - 1];
    const nextSegment = groundTimeline[activeSegmentIndex + 1];
    const previousFrame = previousSegment.frames.at(-1)!;
    const transitionFrame = activeSegment.frames[0];
    const nextFrame = nextSegment.frames[0];

    const prevImg = images[previousFrame];
    const transImg = images[transitionFrame];
    const nextImg = images[nextFrame];

    if (prevImg && transImg && nextImg) {
      if (scrollOffset <= canvas.width) {
        ctx.drawImage(prevImg, -scrollOffset, groundY);
        ctx.drawImage(transImg, canvas.width - scrollOffset, groundY);
      } else {
        const offset = scrollOffset - canvas.width;
        ctx.drawImage(transImg, -offset, groundY);
        ctx.drawImage(nextImg, canvas.width - offset, groundY);
      }
    }
  } else {
    const frameCount = activeSegment.frames.length;
    const segmentProgress = segmentElapsed / activeSegment.duration;
    const exactFrame = segmentProgress * frameCount;
    const currentIndex = Math.floor(exactFrame) % frameCount;
    const nextIndex = (currentIndex + 1) % frameCount;

    const currentImg = images[activeSegment.frames[currentIndex]];
    const nextImg = images[activeSegment.frames[nextIndex]];

    if (currentImg && nextImg) {
      const scrollOffset = isRunning ? easedElapsed * scrollSpeed : 0;
      ctx.drawImage(currentImg, -scrollOffset, groundY);
      ctx.drawImage(nextImg, canvas.width - scrollOffset, groundY);
    } else if (currentImg) {
      ctx.drawImage(currentImg, 0, groundY);
    }
  }
}
