import { useEffect } from 'react';

export function useScrollBottom(
  ref: React.RefObject<HTMLElement>,
  deps: unknown[],
  delay = 0,
) {
  useEffect(() => {
    if (!ref.current) return;
    const t = window.setTimeout(() => {
      ref.current!.scrollTo({
        top: ref.current!.scrollHeight,
        behavior: 'smooth',
      });
    }, delay);
    console.log(`Scrolling to bottom after ${delay}ms delay`);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
