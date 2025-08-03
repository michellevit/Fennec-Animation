// groundConfig.ts

export const scenes = [
  {
    key: "scene_1",
    frames: ["/ground/scene_1/scene_a.png", "/ground/scene_1/scene_b.png"],
  },
  {
    key: "scene_2",
    frames: ["/ground/scene_2/scene_a.png", "/ground/scene_2/scene_b.png"],
  },
  {
    key: "scene_3",
    frames: ["/ground/scene_3/scene_a.png", "/ground/scene_3/scene_b.png"],
  },
  {
    key: "scene_4",
    frames: ["/ground/scene_4/scene_a.png", "/ground/scene_4/scene_b.png"],
  },
];

export const transitions = [
  {
    from: "scene_1",
    to: "scene_2",
    frame: "/ground/transitions/transition_1.png",
  },
  {
    from: "scene_2",
    to: "scene_3",
    frame: "/ground/transitions/transition_2.png",
  },
  {
    from: "scene_3",
    to: "scene_4",
    frame: "/ground/transitions/transition_3.png",
  },
  {
    from: "scene_4",
    to: "scene_1",
    frame: "/ground/transitions/transition_4.png",
  },
];
