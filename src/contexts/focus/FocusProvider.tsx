import React, { useRef } from 'react';
import { FocusContext } from './FocusContext';

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const postCommentsRef = useRef<{ focusCommentInput: () => void } | null>(
    null,
  );

  return (
    <FocusContext.Provider value={{ postCommentsRef }}>
      {children}
    </FocusContext.Provider>
  );
};
