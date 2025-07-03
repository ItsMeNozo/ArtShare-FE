import api from '@/api/baseApi';
import { PaginatedResponse } from '@/api/types/paginated-response.type';
import { HistoryFilter } from '@/features/gen-art/enum';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteTopScroll } from './useInfiniteTopScroll';

const PAGE_SIZE = 10;

export const usePromptHistory = () => {
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>(
    HistoryFilter.ALL,
  );
  const [displayedResults, setDisplayedResults] = useState<PromptResult[]>([]);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use React Query Infinite Query to fetch prompt history with pagination
  const {
    data,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<PaginatedResponse<PromptResult>>({
    queryKey: ['prompt-history', historyFilter.value],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get('/art-generation/prompt-history', {
        params: {
          page: pageParam,
          limit: PAGE_SIZE,
        },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    initialPageParam: 1,
  });

  // Flatten all pages into a single array
  const allPromptResults = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const isInFilterRange = useMemo(
    () =>
      (createdAt: string): boolean => {
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
          case HistoryFilter.ALL:
          default:
            return true;
        }
      },
    [historyFilter],
  );

  // Filter results based on the selected filter (client-side for now)
  const filtered = useMemo(
    () =>
      allPromptResults.filter((r: PromptResult) =>
        isInFilterRange(r.created_at),
      ),
    [allPromptResults, isInFilterRange],
  );

  // Set filtered results as displayed results (already ordered by latest from backend)
  useEffect(() => {
    setDisplayedResults(filtered);
    setInitialScrollDone(false);
  }, [filtered]);

  // Scroll to bottom once
  useLayoutEffect(() => {
    if (!initialScrollDone && scrollRef.current && displayedResults.length) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setInitialScrollDone(true);
    }
  }, [displayedResults, initialScrollDone]);

  // Load more data when scrolling to top
  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Infinite scroll trigger for loading more
  useInfiniteTopScroll(
    scrollRef,
    hasNextPage ?? false,
    loadMore,
    displayedResults.length,
  );

  return {
    scrollRef,
    displayedResults,
    setDisplayedResults,
    loading: loading || isFetchingNextPage,
    historyFilter,
    setHistoryFilter,
  };
};
