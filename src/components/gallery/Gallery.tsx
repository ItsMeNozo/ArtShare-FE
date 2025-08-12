import React, { useEffect, useState } from 'react';
import {
  MasonryPhotoAlbum,
  Photo,
  RenderPhotoContext,
} from 'react-photo-album';
import 'react-photo-album/masonry.css';
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

  const columns = (containerWidth: number) => {
    if (containerWidth >= 1200) return 5;
    if (containerWidth >= 800) return 4;
    if (containerWidth >= 500) return 3;
    return 2;
  };

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
        {stableWidth > 0 && (
          <MasonryPhotoAlbum
            photos={allPhotosFlat}
            spacing={12}
            columns={columns}
            render={{ image: effectiveRenderPhoto }}
          />
        )}
      </InfiniteScroll>
    </div>
  );
};

export default IGallery;
