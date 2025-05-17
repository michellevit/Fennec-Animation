// components/Animation/config/spriteConfig.ts

export const SPRITE_ANIMATION_DURATION = 90; // seconds

export const spriteFrames = {
  start: ["/sprite/start1.png", "/sprite/start2.png"],
  run: ["/sprite/run1.png", "/sprite/run2.png"],
  jump: [
    "/sprite/jump1.png",
    "/sprite/jump2.png",
    "/sprite/jump3.png",
    "/sprite/jump4.png",
    "/sprite/jump5.png",
  ],
};

export const spritePhases = {
  start: {
    frames: spriteFrames.start,
    frameRate: 1,
  },
  run: {
    frames: spriteFrames.run,
    frameRate: 15,
  },
  jump: {
    frames: spriteFrames.jump,
    frameRate: 10,
  },
};

export const spritePhaseTimings = (() => {
  const startDuration =
    spritePhases.start.frames.length / spritePhases.start.frameRate;
  const jumpDuration =
    spritePhases.jump.frames.length / spritePhases.jump.frameRate;
  const runDuration =
    SPRITE_ANIMATION_DURATION - (startDuration + jumpDuration);

  return {
    start: {
      start: 0,
      end: startDuration,
    },
    run: {
      start: startDuration,
      end: startDuration + runDuration,
    },
    jump: {
      start: startDuration + runDuration,
      end: SPRITE_ANIMATION_DURATION,
    },
  };
})();

export const spriteFrameRate = {
  start: 1, // 1 FPS
  run: 6, // 6 FPS - max 30
  jump: 10, // 10 FPS - faster for the jump finale
};

export const spriteAppearance = {
  // see instructinos below
  scale: 0.2,
  offsetX: 0,
  offsetY: 0.0,
};

// spriteAppearance - scale:
// Multiplies the original sprite image size.
// 1 = full size, 0.5 = half, 0.2 = small.

// spriteAppearance - offsetX:
// Positive → moves sprite right
// Negative → moves sprite left
// 0 = horizontally centered

// spriteAppearance - offsetY
// 0 = sprite is touching the bottom edge
// 0.5 = sprite is centered vertically
// 1 = sprite is entirely off the top of the canvas
// Used to simulate "ground level"
