/**
 * Utility functions for handling CORS issues when fetching images
 */

export const fetchImageWithCorsHandling = async (
  url: string,
): Promise<Blob> => {
  try {
    // Try direct fetch with CORS handling first
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache', // Prevents caching issues that block CORS headers
      keepalive: false, // Forces connection closure
      headers: {
        Accept: 'image/*',
        'Content-Type': 'application/octet-stream',
        Connection: 'close', // Prevents connection reuse for better CORS handling
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.warn('Direct fetch failed, trying canvas approach:', error);

    // Fallback to canvas approach for CORS issues
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
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
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to blob conversion failed'));
          }
        }, 'image/png');
      };

      img.onerror = () => {
        reject(new Error('Could not load image for canvas approach'));
      };

      img.src = url;
    });
  }
};

export const downloadImageWithRetry = async (
  imageUrl: string,
  fileName: string,
  maxRetries: number = 3,
): Promise<void> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const blob = await fetchImageWithCorsHandling(imageUrl);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;

      // Extract filename from URL or use provided fileName
      const urlParts = imageUrl.split('/');
      const originalFileName = decodeURIComponent(urlParts.pop() || fileName);
      link.download = originalFileName;

      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      return; // Success, exit the function
    } catch (error) {
      console.warn(`Download attempt ${attempt} failed:`, error);

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retry attempts failed, try fallback methods
  console.warn('All fetch attempts failed, trying fallback methods');

  // Fallback: Try direct download link
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

    // Final fallback: Inform user with better message
    const userConfirm = confirm(
      `Download failed after ${maxRetries} attempts due to server issues. Would you like to open the image in a new tab so you can save it manually?`,
    );

    if (userConfirm) {
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
    }
  }
};
