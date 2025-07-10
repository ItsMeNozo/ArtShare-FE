import { useEffect, useLayoutEffect, useRef } from 'react';

export function useInfiniteTopScroll(
  ref: React.RefObject<HTMLElement>,
  canLoadMore: boolean,
  onLoadMore: () => void,
  itemsLength: number,
  threshold = 100,
) {
  const prevScrollHeightRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);
  const isLoadingRef = useRef<boolean>(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      if (
        !isLoadingRef.current &&
        canLoadMore &&
        element.scrollTop < threshold
      ) {
        isLoadingRef.current = true;

        prevScrollHeightRef.current = element.scrollHeight;
        prevScrollTopRef.current = element.scrollTop;

        onLoadMore();
      }
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, [ref, canLoadMore, onLoadMore, threshold]);

  useLayoutEffect(() => {
    const element = ref.current;
    if (
      !element ||
      !isLoadingRef.current ||
      prevScrollHeightRef.current === 0
    ) {
      if (itemsLength > 0 && !prevScrollHeightRef.current) {
        isLoadingRef.current = false;
      }
      return;
    }

    const newScrollHeight = element.scrollHeight;
    const heightDiff = newScrollHeight - prevScrollHeightRef.current;

    if (heightDiff > 0) {
      element.scrollTop = prevScrollTopRef.current + heightDiff;
    }

    prevScrollHeightRef.current = 0;
    prevScrollTopRef.current = 0;
    isLoadingRef.current = false;
  }, [itemsLength, ref]);
}
