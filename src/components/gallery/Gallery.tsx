import React from 'react';
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
  photos: GalleryPhoto[];
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
  photos,
  isLoading,
  isFetchingNextPage,
  isError,
  error,
  renderPhoto,
  hasNextPage,
  fetchNextPage,
}) => {
  const [ref, { width }] = useMeasure();
  const effectiveRenderPhoto = renderPhoto || ImageRenderer;

  return (
    <div ref={ref} className="relative pb-20 overflow-auto custom-scrollbar">
      <InfiniteScroll
        data={photos}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        isError={isError}
        error={error}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
      >
        {width > 0 && (
          <RowsPhotoAlbum
            defaultContainerWidth={width}
            rowConstraints={{ singleRowMaxHeight: 256 }}
            spacing={8}
            targetRowHeight={256}
            photos={photos}
            render={{ image: effectiveRenderPhoto }}
          />
        )}
      </InfiniteScroll>
    </div>
  );
};

export default IGallery;
