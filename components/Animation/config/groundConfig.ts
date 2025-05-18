// components/Animation/config/groundConfig.ts

// Total animation duration (optional reference)
export const animationDuration = 90; // seconds

// Duration per segment (scene or transition)
export const SEGMENT_DURATION = 10;
// Each segment scrolls left-to-right over this many seconds.
// ↑ Increase to slow everything down. Decrease to speed up (e.g., 6 = faster).

// Scroll distance settings (used in drawGround.ts)
export const DEFAULT_SCROLL_SCREENS = 1;
export const TRANSITION_SCROLL_SCREENS = 2;

export const groundTimeline = [
  {
    duration: SEGMENT_DURATION,
    frames: ["/ground/scene1a.png", "/ground/scene1b.png"],
  },
  { duration: SEGMENT_DURATION, frames: ["/ground/transition1.png"] },
  {
    duration: SEGMENT_DURATION,
    frames: ["/ground/scene2a.png", "/ground/scene2b.png"],
  },
  { duration: SEGMENT_DURATION, frames: ["/ground/transition2.png"] },
  {
    duration: SEGMENT_DURATION,
    frames: ["/ground/scene3a.png", "/ground/scene3b.png"],
  },
  { duration: SEGMENT_DURATION, frames: ["/ground/transition3.png"] },
  {
    duration: SEGMENT_DURATION,
    frames: ["/ground/scene1a.png", "/ground/scene1b.png"],
  },
];
