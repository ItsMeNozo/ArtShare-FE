export type AutoPostStatus = 'draft' | 'scheduled' | 'posted' | 'canceled';

export type AutoPost = {
  id: number;
  content: string;
  imageUrls: string[];
  scheduledAt: Date;
  status: AutoPostStatus;
  createdAt: Date;
  updatedAt: Date;
};

export interface EditAutoPostFormValues {
  content: string;
  images: ImageState[];
  scheduledAt: Date;
}

export interface GenAutoPostFormValues {
  contentPrompt: string;
  postCount: number;
  toneOfVoice: string;
  wordCount: number;
  generateHashtag: boolean;
  includeEmojis: boolean;
}

export interface ImageState {
  id: string;
  status: 'existing' | 'new' | 'uploading' | 'error';
  file?: File; // The actual file object for new images
  url: string; // The S3 URL for existing images, or a local preview URL (URL.createObjectURL) for new ones
}

export interface AutoPostFormValues {
  content: string;
  images: ImageState[];
  scheduledAt: Date | null;
}
