// components/Animation/helpers/buildGroundTimeline.ts
import { scenes, transitions } from "../config/groundConfig";
import { spritePhaseTimings } from "../config/spriteConfig";

export type GroundFrameSegment = {
  imagePath: string;
  startTime: number;
  endTime: number;
};

export function buildGroundTimeline(): GroundFrameSegment[] {
  // Find run phase timing
  const run = spritePhaseTimings.find((p) => p.key === "run");
  if (!run) return [];

  const RUN_START = run.start;
  const RUN_DURATION = run.duration;
  const RUN_END = RUN_START + RUN_DURATION;

  // Duration knobs
  const TRANSITION_DURATION = 2; // seconds per transition
  const WRAP_ONCE = true; // include the wrap transition
  const TAIL_SECONDS = 5; // total seconds for tail A→B→A

  // 1) Build head sequence: scene frames + transitions
  const headSequence: string[] = [];
  scenes.forEach((scene, i) => {
    headSequence.push(...scene.frames);
    const nextKey = scenes[(i + 1) % scenes.length].key;
    const trans = transitions.find(
      (t) => t.from === scene.key && t.to === nextKey
    );
    if (trans) headSequence.push(trans.frame);
  });

  // 2) Tail sequence: fixed A→B→A
  const firstSceneFrames = scenes[0].frames;
  const tailSequence = firstSceneFrames.slice(0, 2).concat(firstSceneFrames[0]);

  // Compute per-segment durations
  const headCount = headSequence.length;
  const tailCount = tailSequence.length;
  const headTotal = Math.max(0, RUN_DURATION - TAIL_SECONDS);
  const headPer = headCount > 0 ? headTotal / headCount : 0;
  const tailPer = tailCount > 0 ? TAIL_SECONDS / tailCount : 0;

  // 3) Build segments
  const segments: GroundFrameSegment[] = [];
  let cursor = RUN_START;

  // Head segments
  for (const path of headSequence) {
    const start = cursor;
    const end = Math.min(cursor + headPer, RUN_END);
    if (end > start)
      segments.push({ imagePath: path, startTime: start, endTime: end });
    cursor = end;
  }

  // Tail segments
  for (const path of tailSequence) {
    const start = cursor;
    const end = Math.min(cursor + tailPer, RUN_END);
    if (end > start)
      segments.push({ imagePath: path, startTime: start, endTime: end });
    cursor = end;
  }

  // 4) Clamp final drift
  if (segments.length) {
    segments[segments.length - 1].endTime = RUN_END;
  }

  return segments;
}
