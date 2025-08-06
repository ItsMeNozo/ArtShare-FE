import React, { useEffect, useState } from 'react';
import { Photo, RenderPhotoContext, RowsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/rows.css';
import useMeasure from 'react-use-measure';
import { InfiniteScroll } from '../InfiniteScroll';
import { ImageRenderer } from './ImageRenderer';

export interface GalleryPhoto extends Photo {
  key: string;
  title: string;
  author: string;
  profilePictureUrl?: string | null;
  postLength: number;
  postId: number;
  isMature: boolean;
  aiCreated: boolean;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
}

interface IGalleryProps {
  photoPages: GalleryPhoto[][];
  allPhotosFlat: GalleryPhoto[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  error: Error | null;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  renderPhoto?: (
    _: unknown,
    context: RenderPhotoContext<GalleryPhoto>,
  ) => React.ReactNode;
}

const IGallery: React.FC<IGalleryProps> = ({
  photoPages,
  allPhotosFlat,
  isLoading,
  isFetchingNextPage,
  isError,
  error,
  renderPhoto,
  hasNextPage,
  fetchNextPage,
}) => {
  const [ref, { width }] = useMeasure({ debounce: 50 });

  const [stableWidth, setStableWidth] = useState(0);

  useEffect(() => {
    const roundedWidth = Math.round(width);
    if (roundedWidth > 0 && roundedWidth !== stableWidth) {
      setStableWidth(roundedWidth);
    }
  }, [width, stableWidth]);

  const effectiveRenderPhoto = renderPhoto || ImageRenderer;

  return (
    <div ref={ref} className="custom-scrollbar relative overflow-auto">
      <InfiniteScroll
        data={allPhotosFlat}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        isError={isError}
        error={error}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
      >
        {stableWidth > 0 &&
          photoPages.map((pagePhotos, index) => (
            <RowsPhotoAlbum
              key={`page-${index}`}
              defaultContainerWidth={stableWidth}
              rowConstraints={{ singleRowMaxHeight: 256 }}
              spacing={8}
              targetRowHeight={256}
              photos={pagePhotos}
              render={{ image: effectiveRenderPhoto }}
            />
          ))}
      </InfiniteScroll>
    </div>
  );
};

export default IGallery;
