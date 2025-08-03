// components/Animation/helpers/buildGroundTimeline.ts
import { scenes, transitions } from "../config/groundConfig";
import { spritePhaseTimings } from "../config/spriteConfig";

export type GroundFrameSegment = {
  imagePath: string;
  startTime: number;
  endTime: number;
};

export function buildGroundTimeline(): GroundFrameSegment[] {
  const run = spritePhaseTimings.find((p) => p.key === "run");
  if (!run) return [];

  const RUN_START = run.start; // 1
  const RUN_END = run.start + run.duration; // 84

  const TRANSITION_DURATION = 2; // each transition
  const WRAP_ONCE = true; // include 4->1

  // Map for quick transition lookup
  const tMap = new Map<string, string>();
  for (const t of transitions) tMap.set(`${t.from}->${t.to}`, t.frame);

  // Helper to push clamped, gap-free segments
  const segments: GroundFrameSegment[] = [];
  let cursor = RUN_START;

  const pushSeg = (imagePath: string, length: number) => {
    const start = cursor;
    const end = Math.min(cursor + Math.max(length, 0), RUN_END);
    if (end > start)
      segments.push({ imagePath, startTime: start, endTime: end });
    cursor = end;
  };

  const N = scenes.length;
  const framesPerScene = scenes[0]?.frames?.length ?? 2;
  const baseTransitions = Math.max(0, N - 1);
  const transitionsUsed = baseTransitions + (WRAP_ONCE ? 1 : 0);
  const timeForTransitions = transitionsUsed * TRANSITION_DURATION;

  const TAIL_SECONDS = 5;

  const usableForScenes = Math.max(
    0,
    RUN_END - RUN_START - timeForTransitions - TAIL_SECONDS
  );
  const PER_FRAME = usableForScenes / (N * framesPerScene);

  // 1) Scenes 1..N with transitions 1..(N-1)
  for (let i = 0; i < N; i++) {
    const scene = scenes[i];
    const frames = scene.frames ?? [];

    // scene frames
    for (const framePath of frames) {
      if (cursor >= RUN_END) break;
      pushSeg(framePath, PER_FRAME);
    }
    if (cursor >= RUN_END) break;

    // transition to next (wrap once after scene_4)
    const isLast = i === N - 1;
    const from = scene.key;
    const to = isLast ? scenes[0].key : scenes[i + 1].key;
    const shouldTransition = !isLast || WRAP_ONCE;
    if (shouldTransition && cursor < RUN_END) {
      const tf = tMap.get(`${from}->${to}`);
      if (tf) pushSeg(tf, TRANSITION_DURATION);
      else pushSeg(frames[frames.length - 1]!, TRANSITION_DURATION); // fallback if frame missing
    }
    if (cursor >= RUN_END) break;
  }

  // 2) Tail: deterministic finish after transition_4
  if (cursor < RUN_END - 1e-6) {
    const [a, b] = scenes[0].frames ?? [];
    if (a && b) {
      const remaining = RUN_END - cursor;

      // Split the remaining time ~50/50 between A and B (tweak if you like)
      const slice1 = Math.max(remaining * 0.5, 1e-3);
      const slice2 = remaining - slice1;

      // Slice 1: scene_1/scene_a
      segments.push({
        imagePath: a,
        startTime: cursor,
        endTime: cursor + slice1,
      });
      cursor += slice1;

      // Slice 2: scene_1/scene_b to RUN_END
      segments.push({ imagePath: b, startTime: cursor, endTime: RUN_END });
      cursor = RUN_END;

      // Tiny static hold on scene_1/scene_b so drawGround's "last segment holds" works
      const EPS = 1 / 60; // ~1 frame
      segments.push({
        imagePath: b,
        startTime: RUN_END,
        endTime: RUN_END + EPS,
      });
      cursor = RUN_END + EPS;
    }
  }

  // IMPORTANT: keep only the non-shrinking clamp (or remove it)
  if (segments.length && segments[segments.length - 1].endTime < RUN_END) {
    segments[segments.length - 1].endTime = RUN_END;
  }

  return segments;
}
