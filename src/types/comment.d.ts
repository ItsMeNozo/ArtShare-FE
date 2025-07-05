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
  user_id: string;

  /** If this is a reply, you get the parent’s id; otherwise null */

  parent_comment_id: number | null;

  /** The resource being commented on (e.g. a post’s id) */
  target_id: number;

  /** Resource type – use the `TargetType` union above */
  target_type: TargetType;

  /** The comment body */
  content: string;

  created_at: Date;
  updated_at: Date;
  like_count: number;

  /** Expanded author record (already defined in ./user) */

  user: User;

  /** Threaded replies – can be empty */
  replies: Comment[];
  reply_count: number;
}
// @/types/comment.ts  (or keep it next to the API file)

/** Payload sent to POST /comments/create */
export interface CreateCommentDto {
  content: string;
  target_id: number;
  target_type: TargetType; // "POST" | "PHOTO" | ...
  parent_comment_id?: number; // present only when replying
}
/** BE model + extra “view‑state” props the UI needs */
export interface CommentUI extends Comment {
  likes?: number;
  likedByCurrentUser?: boolean;
}
