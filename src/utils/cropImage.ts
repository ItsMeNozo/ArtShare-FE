import { Area } from 'react-easy-crop';

export default async function getCroppedImg(
  image: HTMLImageElement,
  pixelCrop: Area,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });

  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  image.crossOrigin = 'anonymous';
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((file) => {
      if (file) resolve(file);
      else reject('Failed to crop image.');
    }, 'image/png'); // ✅ use PNG for transparency
  });
}
