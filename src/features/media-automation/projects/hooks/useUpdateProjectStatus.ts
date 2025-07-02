import { useLoading } from '@/contexts/Loading/useLoading';
import { useSnackbar } from '@/hooks/useSnackbar';
import { extractApiErrorMessage } from '@/utils/error.util';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pauseProject, resumeProject } from '../api/projects.api';
import {
  AutoProjectDetailsDto,
  ProjectStatus,
} from '../types/automation-project';

interface UpdateStatusInput {
  projectId: number;
  newStatus: ProjectStatus;
}

export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoading();

  return useMutation({
    mutationFn: async ({ projectId, newStatus }: UpdateStatusInput) => {
      if (newStatus === 'PAUSED') {
        return pauseProject(projectId);
      }
      return resumeProject(projectId);
    },

    onMutate: ({ newStatus }: UpdateStatusInput) => {
      const message =
        newStatus === 'PAUSED' ? 'Pausing project...' : 'Resuming project...';
      showLoading(message);
    },

    onSuccess: (
      updatedProject: AutoProjectDetailsDto,
      { newStatus }: UpdateStatusInput,
    ) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({
        queryKey: ['projects', updatedProject.id],
      });

      queryClient.setQueryData(['projects', updatedProject.id], updatedProject);

      const message =
        newStatus === 'PAUSED'
          ? 'Project paused successfully!'
          : 'Project resumed successfully!';
      showSnackbar(message, 'success');
    },

    onError: (error: unknown, { newStatus }: UpdateStatusInput) => {
      const action = newStatus === 'PAUSED' ? 'pause' : 'resume';
      const message = extractApiErrorMessage(
        error,
        `Failed to ${action} project.`,
      );
      showSnackbar(message, 'error');
    },

    onSettled: () => {
      hideLoading();
    },
  });
};
