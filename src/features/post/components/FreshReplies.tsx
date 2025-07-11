import { createContext } from 'react';

export const FreshRepliesCtx = createContext<{
  map: Record<number, Set<number>>;
  clear: (parentId: number) => void;
}>({ map: {}, clear: () => {} });
