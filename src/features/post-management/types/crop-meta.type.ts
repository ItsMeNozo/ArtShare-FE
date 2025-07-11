import { Area, Point } from 'react-easy-crop';

export interface ThumbnailMeta {
  crop: Point;
  zoom: number;
  aspect: number | undefined; // naming should've been selectedAspectValue For react-easy-crop's aspect prop
  selectedAspect: string; // naming should've been selectedAspectLabel, For your UI buttons e.g., "1:1", "Free"
  croppedAreaPixels: Area | null; // This is the area to be cropped, used in getCroppedImg function
}
