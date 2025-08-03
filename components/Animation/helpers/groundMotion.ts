// components/Animation/helpers/groundMotion.ts
import { buildGroundTimeline } from "./buildGroundTimeline";

export function getGroundMotionEnd(): number {
  const tl = buildGroundTimeline();
  if (tl.length < 2) return 0;
  const last = tl[tl.length - 1];
  return last.startTime;
}
