export const MAX_IMAGES = 4;
export const MAX_VIDEO = 1;
export const VIDEO_THUMBNAIL_DEFAULT_URL =
  'https://cdn.prod.website-files.com/67862f03f11f4116194d307a/67eff145fcba92bac1eb6bb3_Video-Placeholder.jpg';

export const validateVideoDuration = (
  file: File,
  maxDurationSec = 60,
): Promise<boolean> => {
  return new Promise((resolve) => {
    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    videoElement.onloadedmetadata = () => {
      URL.revokeObjectURL(videoElement.src);
      resolve(videoElement.duration <= maxDurationSec);
    };
    videoElement.onerror = () => resolve(false);
    videoElement.src = URL.createObjectURL(file);
  });
};
