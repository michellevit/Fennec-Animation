// utils/preloadImages.ts

export const preloadImages = async (
  srcs: string[]
): Promise<Record<string, HTMLImageElement>> => {
  const imageMap: Record<string, HTMLImageElement> = {};

  const promises = srcs.map((src) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageMap[src] = img;
        resolve();
      };
    });
  });

  await Promise.all(promises);
  return imageMap;
};
