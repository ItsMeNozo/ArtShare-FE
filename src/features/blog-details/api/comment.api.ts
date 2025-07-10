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
      targetId,
      targetType, // Pass targetType to backend
      ...(parentCommentId != null && { parentCommentId }),
    },
  });
  return data;
};

/**
 * Create a comment or reply.
 * Ensure CreateCommentDto in @/types/comment includes targetType
 * export interface CreateCommentDto {
 *   content: string;
 *   targetId: number;
 *   targetType: "POST" | "BLOG";
 *   parentCommentId?: number;
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
      targetId: blogId,
      targetType: 'BLOG',
    },
  });
  return data;
};
