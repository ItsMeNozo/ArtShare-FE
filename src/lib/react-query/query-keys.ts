export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...postKeys.lists(), filters] as const,
  details: (id: number) => [...postKeys.all, 'details', id] as const,
  userPosts: (username: string) => [...postKeys.all, 'user', username] as const,
  artistPosts: (username: string) =>
    [...postKeys.all, 'artist', username] as const,
  search: (filters: Record<string, unknown>) =>
    [...postKeys.all, 'search', filters] as const,
};

export const commentKeys = {
  all: ['comments'] as const,
  byTarget: (targetType: 'POST' | 'BLOG', targetId: number) =>
    [...commentKeys.all, targetType, targetId] as const,
};

export const subscriptionKeys = {
  all: ['subscription'] as const,
  info: ['subscription', 'info'] as const,
};

export const collectionKeys = {
  all: ['collections'] as const,
  lists: () => [...collectionKeys.all, 'list'] as const,
  listDialog: () => [...collectionKeys.all, 'list-dialog'] as const,
  me: () => [...collectionKeys.all, 'me'] as const,
  public: (username: string) =>
    [...collectionKeys.all, 'public', username] as const,
};

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...projectKeys.lists(), filters] as const,
  details: (id: number) => [...projectKeys.all, 'details', id] as const,
};

export const userKeys = {
  all: ['users'] as const,
  profile: (userId?: string) => [...userKeys.all, 'profile', userId] as const,
  search: (query: string) => [...userKeys.all, 'search', query] as const,
};

export const blogKeys = {
  all: ['blogs'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...blogKeys.lists(), filters] as const,
  search: (query: string) => [...blogKeys.all, 'search', query] as const,
};

export const autoPostKeys = {
  all: ['auto-posts'] as const,
  lists: () => [...autoPostKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...autoPostKeys.lists(), filters] as const,
  details: (id: number) => [...autoPostKeys.all, 'details', id] as const,
};
