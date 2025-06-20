export const postKeys = {
  all: ["posts"] as const,
  details: (id: number) => ["postDetails", id] as const,
};

export const subscriptionKeys = {
  info: ["subscriptionInfo"] as const,
};
