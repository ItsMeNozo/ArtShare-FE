export type AutoPostStatus = 'draft' | 'scheduled' | 'posted' | 'canceled';

export type AutoPost = {
  id: number;
  content: string;
  image_urls: string[];
  scheduled_at: Date;
  status: AutoPostStatus;
  created_at: Date;
  updated_at: Date;
};

export interface EditAutoPostFormValues {
  content: string;
  images: ImageState[];
  scheduled_at: Date;
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
  scheduled_at: Date | null;
}
