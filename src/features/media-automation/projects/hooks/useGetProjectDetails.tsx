import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getProjectDetails } from '../api/projects.api';

export const useGetProjectDetails = (
  projectId?: string | number,
  options?: { enabled?: boolean },
) => {
  const numericId = projectId ? Number(projectId) : undefined;
  return useQuery({
    queryKey: ['projects', numericId],
    queryFn: () => {
      if (!numericId) {
        throw new Error('Project ID is required to fetch details.');
      }
      return getProjectDetails(numericId);
    },

    enabled: !!numericId && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: keepPreviousData,
  });
};
