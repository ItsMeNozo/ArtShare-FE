import { User } from './user';

/**Supported resources a comment can belong to (extend as you add more). */

/**
 * A single comment.
 * `replies` is recursive so you can nest threaded conversations indefinitely.
 */
export interface Comment {
  /** Primary key in your DB */
  id: number;

  /** FK to Users table – always present even though `user` is expanded below */
  userId: string;

  /** If this is a reply, you get the parent’s id; otherwise null */

  parentCommentId: number | null;

  /** The resource being commented on (e.g. a post’s id) */
  targetId: number;

  /** Resource type – use the `TargetType` union above */
  targetType: TargetType;

  /** The comment body */
  content: string;

  createdAt: Date;
  updatedAt: Date;
  likeCount: number;

  /** Expanded author record (already defined in ./user) */

  user: User;

  /** Threaded replies – can be empty */
  replies: Comment[];
  replyCount: number;
}
// @/types/comment.ts  (or keep it next to the API file)

/** Payload sent to POST /comments/create */
export interface CreateCommentDto {
  content: string;
  targetId: number;
  targetType: TargetType; // "POST" | "PHOTO" | ...
  parentCommentId?: number; // present only when replying
}
/** BE model + extra “view‑state” props the UI needs */
export interface CommentUI extends Comment {
  likes?: number;
  likedByCurrentUser?: boolean;
}
