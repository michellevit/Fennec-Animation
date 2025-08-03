export const fadeConfig = {
  enabled: true,

  // Fade in: from black → transparent
  in: {
    start: 0,
    duration: 0.6,
    ease: "outCubic",
  },

  // Fade out: from transparent → black
  out: {
    start: 85,
    duration: 5.0,
    ease: "inCubic",
  },
} as const;
