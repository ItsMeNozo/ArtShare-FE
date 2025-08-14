import { fetchImageWithCorsHandling } from './cors-handling';

const getFilenameFromUrl = (url: string, defaultName: string): string => {
  const parts = url.split('/');
  return parts[parts.length - 1] || defaultName;
};

export const fetchImageFileFromUrl = async (url: string): Promise<File> => {
  const blob = await fetchImageWithCorsHandling(url);
  const filename = getFilenameFromUrl(url, 'image.jpg');
  return new File([blob], filename, { type: blob.type });
};

export const fetchVideoFileFromUrl = async (url: string): Promise<File> => {
  try {
    const res = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }

    const blob = await res.blob();
    const filename = getFilenameFromUrl(url, 'video.mp4');
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.error('Video fetch failed:', error);
    throw error;
  }
};
