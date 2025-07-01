import api from '@/api/baseApi';
import { PaginatedResponse } from '@/api/types/paginated-response.type';
import { getQueryParams } from '@/utils';
import {
  AutoProjectDetailsDto,
  AutoProjectListItem,
  Order,
  SortableKeys,
} from '../types/automation-project';

export interface SaveAutoProjectPayload {
  title: string;
  description: string;
  platform_id: number;
}

export const createAutoProject = async (
  payload: SaveAutoProjectPayload,
): Promise<AutoProjectDetailsDto> => {
  const response = await api.post<AutoProjectDetailsDto>(
    '/auto-project',
    payload,
  );
  return response.data;
};

export const updateAutoProject = async (
  projectId: number,
  payload: SaveAutoProjectPayload,
): Promise<AutoProjectDetailsDto> => {
  const response = await api.put<AutoProjectDetailsDto>(
    `/auto-project/${projectId}`,
    payload,
  );
  return response.data;
};

export const getProjectDetails = async (
  projectId: number,
): Promise<AutoProjectDetailsDto> => {
  const response = await api.get<AutoProjectDetailsDto>(
    `/auto-project/${projectId}`,
  );
  return response.data;
};

interface GetProjectsParams {
  page: number;
  limit: number;
  sortBy: SortableKeys;
  sortOrder: Order;
}

export const getProjects = async (
  params: GetProjectsParams,
): Promise<PaginatedResponse<AutoProjectListItem>> => {
  const queryParams = getQueryParams(params);
  const response = await api.get(`/auto-project${queryParams}`);
  return response.data;
};
