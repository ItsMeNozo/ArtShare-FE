export const getStatusChipProps = (status: string) => {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'bg-green-500';
    case 'PAUSED':
      return 'bg-yellow-500';
    case 'DRAFT':
      return 'bg-gray-400';
    case 'COMPLETED':
      return 'bg-blue-500';
    case 'COMPLETED_WITH_ERRORS':
      return 'bg-orange-500';
    case 'FAILED':
      return 'bg-red-500';
    default:
      return 'bg-gray-300';
  }
};
