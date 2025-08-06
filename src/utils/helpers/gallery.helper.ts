export const getMediaDimensions = (
  url: string,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    if (!url) {
      console.warn(
        'getMediaDimensions called with missing URL. Using default.',
      );
      resolve({ width: 256, height: 256 });
      return;
    }
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = (err) => {
      console.error('Error loading image for dimensions:', url, err);

      resolve({ width: 256, height: 256 });
    };
    img.src = url;
  });
};
