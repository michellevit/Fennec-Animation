export const fadeConfig = {
  enabled: true,

  // Fade in: from black → transparent
  in: {
    start: 0,
    duration: 1.5,
    ease: "outCubic",
  },

  // Fade out: from transparent → black
  out: {
    start: 82,
    duration: 8.0,
    ease: "inCubic",
  },
} as const;
