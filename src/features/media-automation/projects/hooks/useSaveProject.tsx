import { useLoading } from '@/contexts/Loading/useLoading';
import { useSnackbar } from '@/hooks/useSnackbar';
import { projectKeys } from '@/lib/react-query/query-keys';
import { extractApiErrorMessage } from '@/utils/error.util';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAutoProject,
  SaveAutoProjectPayload,
  updateAutoProject,
} from '../api/projects.api';
import { ProjectFormValues } from '../types';
import { AutoProjectDetailsDto } from '../types/automation-project';

interface UseSaveProjectOptions {
  onSuccess?: (data: AutoProjectDetailsDto) => void;
  onError?: (errorMessage: string) => void;
}

export const useSaveProject = ({
  onSuccess,
  onError,
}: UseSaveProjectOptions) => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoading();

  return useMutation({
    mutationFn: (input: SaveProjectInput) => {
      const { values, id } = input;
      const payload: SaveAutoProjectPayload = {
        title: values.projectName,
        description: values.description,
        platformId: values.platform.id,
      };
      if (id) {
        return updateAutoProject(id, payload);
      }
      return createAutoProject(payload);
    },

    onMutate: (input: SaveProjectInput) => {
      const message = input.id ? 'Saving changes...' : 'Creating project...';
      showLoading(message);
    },

    onSettled: () => {
      hideLoading();
    },

    onSuccess: (savedProject, input) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: ['platforms'] });

      if (input.id) {
        queryClient.invalidateQueries({
          queryKey: projectKeys.details(input.id),
        });
      }

      const message = input.id
        ? 'Project updated successfully!'
        : 'Project created successfully!';
      showSnackbar(message, 'success');

      onSuccess?.(savedProject);
    },

    onError: (error, input) => {
      const action = input.id ? 'update' : 'create';
      const message = extractApiErrorMessage(
        error,
        `Failed to ${action} project.`,
      );
      showSnackbar(message, 'error');
      onError?.(message);
    },
  });
};

interface SaveProjectInput {
  values: ProjectFormValues;
  id?: number;
}
