import { ProjectStatus } from '../types/automation-project';

export const getStatusChipProps = (status: ProjectStatus) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-500';
    case 'PAUSED':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-300';
  }
};
