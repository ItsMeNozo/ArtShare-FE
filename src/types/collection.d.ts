export interface Collection {
  id: number;
  name: string;
  isPrivate: boolean;
  thumbnailUrl?: string;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  posts: Post[];
}
