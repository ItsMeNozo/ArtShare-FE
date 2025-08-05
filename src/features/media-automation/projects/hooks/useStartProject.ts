import { useLoading } from '@/contexts/Loading/useLoading';
import { useSnackbar } from '@/hooks/useSnackbar';
import { extractApiErrorMessage } from '@/utils/error.util';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startProject } from '../api/projects.api';
import { AutoProjectDetailsDto } from '../types/automation-project';

interface StartProjectInput {
  projectId: number;
}

export const useStartProject = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoading();

  return useMutation({
    mutationFn: async ({ projectId }: StartProjectInput) => {
      return startProject(projectId);
    },

    onMutate: () => {
      showLoading('Starting project...');
    },

    onSuccess: (updatedProject: AutoProjectDetailsDto) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({
        queryKey: ['projects', updatedProject.id],
      });

      queryClient.setQueryData(['projects', updatedProject.id], updatedProject);

      showSnackbar('Project started successfully!', 'success');
    },

    onError: (error: unknown) => {
      const message = extractApiErrorMessage(error, 'Failed to start project.');
      showSnackbar(message, 'error');
    },

    onSettled: () => {
      hideLoading();
    },
  });
};
