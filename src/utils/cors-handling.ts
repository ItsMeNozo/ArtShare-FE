const createCanvasFromImage = (img: HTMLImageElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    canvas.toBlob((blob) => {
      blob
        ? resolve(blob)
        : reject(new Error('Canvas to blob conversion failed'));
    }, 'image/png');
  });
};

const addCacheBuster = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_cb=${Date.now()}`;
};

const loadImageWithCors = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error('Could not load image for canvas approach'));

    // Use cache-busted URL to avoid cached non-CORS images
    img.src = addCacheBuster(url);
  });
};

export const fetchImageWithCorsHandling = async (
  url: string,
): Promise<Blob> => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      keepalive: false,
      headers: {
        Accept: 'image/*',
        'Content-Type': 'application/octet-stream',
        Connection: 'close',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.warn('Direct fetch failed, trying canvas approach:', error);

    const img = await loadImageWithCors(url);
    return createCanvasFromImage(img);
  }
};

export const downloadImageWithRetry = async (
  imageUrl: string,
  fileName: string,
  maxRetries: number = 3,
): Promise<void> => {
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const blob = await fetchImageWithCorsHandling(imageUrl);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;

      const urlParts = imageUrl.split('/');
      const originalFileName = decodeURIComponent(urlParts.pop() || fileName);
      link.download = originalFileName;

      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      return;
    } catch (error) {
      console.warn(`Download attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        await sleep(delay);
      }
    }
  }

  console.warn('All fetch attempts failed, trying fallback methods');

  try {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Direct download failed:', error);

    const userConfirm = confirm(
      `Download failed after ${maxRetries} attempts due to server issues. Would you like to open the image in a new tab so you can save it manually?`,
    );

    if (userConfirm) {
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
    }
  }
};
