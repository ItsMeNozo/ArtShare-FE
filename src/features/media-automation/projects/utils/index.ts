import { ProjectStatus } from '../types/automation-project';

export const getStatusChipProps = (status: ProjectStatus) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-500';
    case 'active':
      return 'bg-green-500';
    case 'scheduled':
      return 'bg-yellow-500';
    case 'canceled':
      return 'bg-red-500';
    default:
      return 'bg-gray-300';
  }
};
