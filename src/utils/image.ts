import { IMAGE_DIMENSIONS } from './constants';

export function getImageDimensions(aspectRatio: string): [number, number] {
  switch (aspectRatio.toUpperCase()) {
    case 'SQUARE':
      return IMAGE_DIMENSIONS.SQUARE as [number, number];
    case 'LANDSCAPE':
      return IMAGE_DIMENSIONS.LANDSCAPE as [number, number];
    case 'PORTRAIT':
      return IMAGE_DIMENSIONS.PORTRAIT as [number, number];
    default:
      return IMAGE_DIMENSIONS.SQUARE as [number, number];
  }
}
// Only one implementation should exist
