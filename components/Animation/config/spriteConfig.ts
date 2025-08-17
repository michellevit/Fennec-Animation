// spriteConfig.ts

export const SPRITE_ANIMATION_DURATION = 90;
export const spriteDisappearBeforeEnd = 4; // 86–90 silent/no sprite

export const spritePhases = [
  {
    key: "start",
    duration: 1, // 0–1
    frameRate: 0, // ignored for oneShot
    frames: ["/sprite/start1.png", "/sprite/start2.png"],
    oneShot: true,
    holdLastFrame: true, // hold start2 until run begins
  },
  {
    key: "run",
    duration: "auto", // auto = 84s → 1–85
    frameRate: 9.5,
    frames: ["/sprite/run1.png", "/sprite/run2.png"],
    oneShot: false,
    holdLastFrame: false,
  },
  {
    key: "jump",
    duration: 1, // 85–86
    frameRate: 0, // ignored for oneShot
    frames: [
      "/sprite/jump1.png",
      "/sprite/jump2.png",
      "/sprite/jump3.png",
      "/sprite/jump4.png",
      "/sprite/jump5.png",
    ],
    oneShot: true,
    holdLastFrame: false, // hide after jump5
  },
  {
    key: "disappear",
    duration: spriteDisappearBeforeEnd, // 86–90
    frameRate: 0,
    frames: [], // no sprite
    oneShot: false,
    holdLastFrame: false,
  },
];

export const beatSync = {
  bpm: 161.5,
  framesPerBeat: 2,
  audioLeadSec: 1.544,
  runStartsAtSec: 1.0,
};

// Build absolute timings
export const spritePhaseTimings = (() => {
  const totalExplicit = spritePhases.reduce(
    (acc, p) => acc + (typeof p.duration === "number" ? p.duration : 0),
    0
  );
  const autoCount = spritePhases.filter((p) => p.duration === "auto").length;
  const autoDuration =
    (SPRITE_ANIMATION_DURATION - totalExplicit) / Math.max(1, autoCount);

  let cursor = 0;
  return spritePhases.map((p) => {
    const duration = typeof p.duration === "number" ? p.duration : autoDuration;
    const timing = {
      key: p.key,
      start: cursor,
      end: cursor + duration,
      duration,
      frameRate: p.frameRate,
      frames: p.frames,
      oneShot: !!(p as any).oneShot,
      holdLastFrame: !!(p as any).holdLastFrame,
    };
    cursor += duration;
    return timing;
  });
})();

export const spriteAppearance = {
  scale: 0.2,
  offsetX: 0,
  offsetY: 0,
};
