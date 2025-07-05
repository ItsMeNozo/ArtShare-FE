import { createContext } from 'react';

type FocusContextType = {
  postCommentsRef: React.RefObject<{ focusCommentInput: () => void } | null>;
};

export const FocusContext = createContext<FocusContextType | undefined>(
  undefined,
);
