import { AutoPostStatus } from '../types';

export const getStatusChipProps = (status: AutoPostStatus) => {
  switch (status) {
    case 'draft':
      return 'bg-yellow-500';
    case 'scheduled':
      return 'bg-blue-500';
    case 'posted':
      return 'bg-green-500';
    case 'canceled':
      return 'bg-red-500';
    default:
      return 'bg-gray-300';
  }
};
