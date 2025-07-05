export const getMediaDimensions = (
  url: string,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    if (!url) {
      console.warn(
        'getMediaDimensions called with missing URL. Using default.',
      );
      resolve({ width: 500, height: 500 });
      return;
    }
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = (err) => {
      console.error('Error loading image for dimensions:', url, err);

      resolve({ width: 500, height: 500 });
    };
    img.src = url;
  });
};
