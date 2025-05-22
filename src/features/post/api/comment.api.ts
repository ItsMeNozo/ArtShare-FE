import api from "@/api/baseApi";
import { Comment, CreateCommentDto } from "@/types/comment";

/** Get comments for a given post id (returns the response data only). */
export const fetchComments = async (postId: number): Promise<Comment[]> => {
  const { data } = await api.get<Comment[]>("/comments", {
    params: {
      target_id: postId,
      target_type: "POST",
      likedByCurrentUser: Boolean,
    },
  });
  console.log(data);
  return data;
};
export const fetchBlogComments = async (postId: number): Promise<Comment[]> => {
  const { data } = await api.get<Comment[]>("/comments", {
    params: {
      target_id: postId,
      target_type: "BLOG",
      likedByCurrentUser: Boolean,
    },
  });
  console.log(data);
  return data;
};
/** NEW: create a comment (or reply) */
export const createComment = async (payload: CreateCommentDto) => {
  return await api.post<Comment>("/comments/create", payload);
};
/** Like a comment */
export const likeComment = async (commentId: number) => {
  return await api.post(`/comments/${commentId}/like`);
};
export const unlikeComment = async (commentId: number) => {
  return await api.post(`/comments/${commentId}/unlike`);
};
