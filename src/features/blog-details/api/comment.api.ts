import api from '@/api/baseApi';

import type { Comment as CommentUI, CreateCommentDto } from '@/types/comment';
import { TargetType } from '@/utils/constants';

/**
 * Fetch comments for a target (post or blog), optionally for a specific parent comment (replies).
 */
export const fetchComments = async (
  targetId: number,
  targetType: TargetType, // Added targetType
  parentCommentId?: number,
): Promise<CommentUI[]> => {
  const { data } = await api.get<CommentUI[]>('/comments', {
    params: {
      target_id: targetId,
      target_type: targetType, // Pass targetType to backend
      ...(parentCommentId != null && { parent_comment_id: parentCommentId }),
    },
  });
  return data;
};

/**
 * Create a comment or reply.
 * Ensure CreateCommentDto in @/types/comment includes target_type
 * export interface CreateCommentDto {
 *   content: string;
 *   target_id: number;
 *   target_type: "POST" | "BLOG";
 *   parent_comment_id?: number;
 * }
 */
export const createComment = async (
  payload: CreateCommentDto,
): Promise<CommentUI> => {
  const { data } = await api.post<CommentUI>('/comments/create', payload);
  return data;
};

/**
 * Update a comment.
 */
export const updateComment = async (
  commentId: number,
  content: string,
): Promise<CommentUI> => {
  const { data } = await api.patch<CommentUI>(`/comments/${commentId}`, {
    content,
  });
  return data;
};

/**
 * Delete a comment.
 */
export const deleteComment = async (commentId: number): Promise<void> => {
  await api.delete(`/comments/${commentId}`);
};

/**
 * Like a comment.
 */
export const likeComment = async (commentId: number): Promise<void> => {
  await api.post(`/comments/${commentId}/like`);
};

/**
 * Unlike a comment.
 */
export const unlikeComment = async (commentId: number): Promise<void> => {
  await api.post(`/comments/${commentId}/unlike`);
};

// This specific fetcher can still be used by BlogDetails for its initial query
// if you prefer to keep it separate, or BlogDetails can use the generic fetchComments.
export const fetchBlogComments = async (
  blogId: number,
): Promise<CommentUI[]> => {
  const { data } = await api.get<CommentUI[]>('/comments', {
    params: {
      target_id: blogId,
      target_type: 'BLOG',
    },
  });
  return data;
};
