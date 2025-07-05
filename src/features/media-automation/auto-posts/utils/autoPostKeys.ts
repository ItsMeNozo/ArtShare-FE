import { UseGetAutoPostsOptions } from '../hooks/useGetAutoPosts';

const autoPostsBaseKey = 'autoPosts';

export const autoPostKeys = {
  lists: () => [autoPostsBaseKey, 'list'] as const,

  list: (options: UseGetAutoPostsOptions) =>
    [...autoPostKeys.lists(), options] as const,

  details: (postId: number) => [autoPostsBaseKey, 'details', postId],
};
