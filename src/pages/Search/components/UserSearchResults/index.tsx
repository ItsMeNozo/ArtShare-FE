import { InfiniteScroll } from '@/components/InfiniteScroll';
import Loading from '@/components/loading/Loading';
import { Box } from '@mui/material';
import { useMemo } from 'react';
import { RowsPhotoAlbum } from 'react-photo-album';
import useMeasure from 'react-use-measure';
import { useSearchUsers } from '../../hooks/useSearchUsers';
import { UserPhotoRenderer } from './UserPhotoRenderer';

interface UserSearchResultsProps {
  searchQuery: string | null;
}

const UserSearchResults = ({ searchQuery }: UserSearchResultsProps) => {
  const [ref, { width }] = useMeasure();
  const {
    data,
    isLoading,
    isFetchingNextPage,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
  } = useSearchUsers({
    searchQuery: searchQuery ?? '',
    enabled: !!searchQuery,
  });

  const photos = useMemo(() => {
    return data?.pages.flatMap((page) => page.photos) ?? [];
  }, [data]);

  return (
    <Box ref={ref}>
      {isLoading && photos.length === 0 && <Loading />}
      <InfiniteScroll
        data={photos}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        isError={isError}
        error={error}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
      >
        <RowsPhotoAlbum
          defaultContainerWidth={width}
          photos={photos}
          spacing={8}
          targetRowHeight={250}
          rowConstraints={{ singleRowMaxHeight: 256 }}
          render={{ image: UserPhotoRenderer }}
        />
      </InfiniteScroll>
    </Box>
  );
};

export default UserSearchResults;
