export const postKeys = {
  all: ['posts', 'list'] as const,
  details: (id: number) => ['postDetails', id] as const,
};

export const subscriptionKeys = {
  info: ['subscriptionInfo'] as const,
};
