import { createContext } from 'react';

// Define the shape of the context's value
export interface LoadingContextType {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

export const LoadingContext = createContext<LoadingContextType | undefined>(
  undefined,
);
