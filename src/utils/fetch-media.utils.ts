export const fetchImageFileFromUrl = async (url: string): Promise<File> => {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'cache-control': 'no-cache',
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }

  const blob = await res.blob();

  const parts = url.split('/');
  const filename = parts[parts.length - 1] || 'image.jpg';

  return new File([blob], filename, { type: blob.type });
};

export const fetchVideoFileFromUrl = async (url: string): Promise<File> => {
  const res = await fetch(url, {
    method: 'GET',
    // headers: {
    //   "cache-control": "no-cache",
    // },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }

  const blob = await res.blob();

  const parts = url.split('/');
  const filename = parts[parts.length - 1] || 'video.mp4';

  return new File([blob], filename, { type: blob.type });
};
