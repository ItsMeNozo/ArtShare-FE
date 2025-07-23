// PostStatus enum and Post type for scheduling feature

export enum PostStatus {
  PENDING = 'PENDING',
  POSTED = 'POSTED',
}

export type Post = {
  id: number;
  autoProjectId: number;
  content: string;
  scheduledAt: string;
  status: PostStatus;
};
