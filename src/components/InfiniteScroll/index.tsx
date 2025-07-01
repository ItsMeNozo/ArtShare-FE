import Loading from '@/components/loading/Loading';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { ReactNode, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export interface InfiniteScrollProps {
  data: unknown[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  error: Error | null;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  children: ReactNode;
}

export const InfiniteScroll = ({
  data,
  isLoading,
  isFetchingNextPage,
  isError,
  error,
  hasNextPage,
  fetchNextPage,
  children,
}: InfiniteScrollProps) => {
  const { ref, inView } = useInView({
    threshold: 0, // Trigger as soon as 1px of the element is visible
    rootMargin: '400px', // Start fetching 400px *before* the user reaches the end
    // Tell the hook to completely ignore intersection events while we are fetching.
    // This is the key to breaking the rapid-fire loop.
    skip: isFetchingNextPage,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // Handle the initial full-page loading state
  if (isLoading && data.length === 0) {
    return <Loading />;
  }

  // Handle a critical error on the initial load
  if (isError && data.length === 0) {
    console.error('Initial load error:', error);
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load data. Please try again later.
      </Alert>
    );
  }

  return (
    <Box className="flex-1 overflow-y-auto">
      {children}

      {data.length === 0 && (
        <p className="text-mountain-500 dark:text-mountain-400 text-center">
          No results found.
        </p>
      )}

      {hasNextPage && (
        <div ref={ref} style={{ height: '1px', width: '100%' }} />
      )}

      {/* Inline loading spinner for subsequent page fetches */}
      {isFetchingNextPage && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            my: 4,
            gap: 2,
          }}
        >
          <CircularProgress size={24} />
          <Typography>Loading more...</Typography>
        </Box>
      )}

      {!isLoading && !hasNextPage && data.length > 0 && (
        <Box className="my-2 text-center text-lg">
          <Typography variant="body2" color="text.secondary">
            You have reached the end.
          </Typography>
        </Box>
      )}

      {isError && !isFetchingNextPage && data.length > 0 && (
        <Alert severity="warning" sx={{ m: 2 }}>
          Could not load more items at this time.
        </Alert>
      )}
    </Box>
  );
};
