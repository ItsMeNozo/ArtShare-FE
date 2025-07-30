import { useCallback, useRef } from 'react';

export const useDebounce = () => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debounce = useCallback((fn: () => void, delay: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(fn, delay);
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { debounce, cancel };
};
