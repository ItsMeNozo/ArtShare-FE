import api from '@/api/baseApi';
import { HistoryFilter } from '@/features/gen-art/enum';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteTopScroll } from './useInfiniteTopScroll';

const PAGE_SIZE = 5;

export const usePromptHistory = () => {
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>(
    HistoryFilter.ALL,
  );
  const [promptResultList, setPromptResultList] = useState<PromptResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(PAGE_SIZE);
  const [displayedResults, setDisplayedResults] = useState<PromptResult[]>([]);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isInFilterRange = (createdAt: string): boolean => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    switch (historyFilter) {
      case HistoryFilter.LAST7DAYS: {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 6);
        return createdDate >= sevenDaysAgo && createdDate <= now;
      }
      case HistoryFilter.LAST30DAYS: {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 29);
        return createdDate >= thirtyDaysAgo && createdDate <= now;
      }
      default:
        return true;
    }
  };

  // Fetch history on mount
  useEffect(() => {
    api
      .get('/art-generation/prompt-history')
      .then((res) => {
        if (res.data && Array.isArray(res.data.data)) {
          setPromptResultList(res.data.data);
        } else if (Array.isArray(res.data)) {
          setPromptResultList(res.data);
        } else {
          setPromptResultList([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Reset pagination when filter or data changes
  useEffect(() => {
    setLoadedCount(PAGE_SIZE);
    setInitialScrollDone(false);
  }, [historyFilter, promptResultList]);

  // Filter and reverse
  const filtered = useMemo(
    () => promptResultList.filter((r) => isInFilterRange(r.createdAt)),
    [promptResultList, historyFilter],
  );
  const reversed = useMemo(() => filtered.slice().reverse(), [filtered]);

  // Compute slice
  useEffect(() => {
    const start = Math.max(0, reversed.length - loadedCount);
    setDisplayedResults(reversed.slice(start));
  }, [reversed, loadedCount]);

  // Scroll to bottom once
  useLayoutEffect(() => {
    if (!initialScrollDone && scrollRef.current && displayedResults.length) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setInitialScrollDone(true);
    }
  }, [displayedResults, initialScrollDone]);

  // Infinite scroll trigger
  useInfiniteTopScroll(
    scrollRef as React.RefObject<HTMLElement>,
    displayedResults.length < reversed.length,
    () => setLoadedCount((c) => c + PAGE_SIZE),
    displayedResults.length,
  );

  return {
    scrollRef,
    displayedResults,
    setDisplayedResults,
    loading,
    historyFilter,
    setHistoryFilter,
  };
};