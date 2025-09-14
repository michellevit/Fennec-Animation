// components/Animation/helpers/buildGroundTimeline.ts
import { scenes, transitions } from "../config/groundConfig";
import { spritePhaseTimings } from "../config/spriteConfig";

export type GroundFrameSegment = {
  imagePath: string;
  startTime: number; // seconds
  endTime: number; // seconds
};

/**
 * Build a ground timeline that scales to the actual audio duration (seconds).
 * If `totalDurationSec` is missing/0, we infer a baseline from config and use that.
 */
export function buildGroundTimeline(
  totalDurationSec?: number
): GroundFrameSegment[] {
  const run = spritePhaseTimings.find((p) => p.key === "run");
  if (!run) return [];

  const RUN_START_BASE = run.start ?? 0;
  const RUN_DURATION_BASE = run.duration ?? 0;

  // baseline tail length used in original setup
  const TAIL_SECONDS_BASE = 5;

  // derive baseline track length from your config
  const BASELINE_TRACK_SECONDS = Math.max(
    1,
    RUN_START_BASE + RUN_DURATION_BASE + TAIL_SECONDS_BASE
  );

  // choose actual track seconds (fallback to baseline if none provided)
  const trackSec =
    Number.isFinite(totalDurationSec) && (totalDurationSec as number) > 0
      ? (totalDurationSec as number)
      : BASELINE_TRACK_SECONDS;

  const scale = trackSec / BASELINE_TRACK_SECONDS;

  // scale windows proportionally
  const RUN_START = RUN_START_BASE * scale;
  const RUN_DURATION = RUN_DURATION_BASE * scale;
  const RUN_END = RUN_START + RUN_DURATION;
  const TAIL_SECONDS = TAIL_SECONDS_BASE * scale;

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

  // 2) Tail sequence: fixed A→B→A from first scene
  const firstSceneFrames = scenes[0]?.frames ?? [];
  const tailSequence =
    firstSceneFrames.length >= 2
      ? firstSceneFrames.slice(0, 2).concat(firstSceneFrames[0])
      : firstSceneFrames.slice(0, 1);

  // distribute time evenly
  const headCount = headSequence.length;
  const tailCount = tailSequence.length;
  const headTotal = Math.max(0, RUN_DURATION - TAIL_SECONDS);
  const headPer = headCount > 0 ? headTotal / headCount : 0;
  const tailPer = tailCount > 0 ? TAIL_SECONDS / tailCount : 0;

  const segments: GroundFrameSegment[] = [];
  let cursor = RUN_START;

  for (const path of headSequence) {
    const start = cursor;
    const end = Math.min(cursor + headPer, RUN_END);
    if (end > start)
      segments.push({ imagePath: path, startTime: start, endTime: end });
    cursor = end;
  }

  for (const path of tailSequence) {
    const start = cursor;
    const end = Math.min(cursor + tailPer, RUN_END);
    if (end > start)
      segments.push({ imagePath: path, startTime: start, endTime: end });
    cursor = end;
  }

  if (segments.length) {
    segments[segments.length - 1].endTime = RUN_END;
  }

  return segments;
}
