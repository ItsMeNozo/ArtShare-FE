import api from '@/api/baseApi';
import { PaginatedResponse } from '@/api/types/paginated-response.type';
import { getQueryParams } from '@/utils';
import { Order } from '../../projects/types/automation-project';
import { AutoPost, AutoPostStatus } from '../types';

export interface GetAutoPostsParams {
  autoProjectId: number;
  status?: AutoPostStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: Order;
}

export const getAutoPosts = async (
  params: GetAutoPostsParams,
): Promise<PaginatedResponse<AutoPost>> => {
  const response = await api.get(`/auto-post${getQueryParams(params)}`);
  return response.data;
};

export const getAutoPostDetails = async (
  autoPostId: number,
): Promise<AutoPost> => {
  const response = await api.get(`/auto-post/${autoPostId}`);
  return response.data;
};

export interface GenAutoPostsPayload {
  autoProjectId: number;
  contentPrompt: string;
  postCount: number;
  toneOfVoice: string;
  wordCount: number;
  generateHashtag: boolean;
  includeEmojis: boolean;
}
export const genAutoPosts = async (
  payload: GenAutoPostsPayload,
): Promise<AutoPost[]> => {
  const response = await api.post('/auto-post/generate', payload);
  return response.data;
};

export class EditAutoPostPayload {
  content?: string;
  scheduledAt?: Date;
  imageUrls?: string[];
}

export const editAutoPost = async (
  autoPostId: number,
  payload: EditAutoPostPayload,
): Promise<AutoPost> => {
  const response = await api.patch(`/auto-post/${autoPostId}`, payload);
  return response.data;
};

export const deleteAutoPost = async (autoPostId: number): Promise<void> => {
  await api.delete(`/auto-post/${autoPostId}`);
};

export const editWithAi = async (seedPrompt: string): Promise<string> => {
  const response = await api.post('/auto-post/edit-content', { seedPrompt });
  return response.data;
};
