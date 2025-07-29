import { CircularProgress } from '@mui/material';
import React from 'react';
import { Photo, RenderPhotoContext, RowsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/rows.css';
import useMeasure from 'react-use-measure';
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
}) => {
  const [ref, { width }] = useMeasure();
  if (isLoading) {
    return (
      <div className="flex justify-center items-center space-x-4 h-64">
        <CircularProgress size={36} />
        <p>Loading...</p>
      </div>
    );
  }

  if (isError && !isLoading && photos.length === 0) {
    console.error('Error loading initial posts:', error);

    return (
      <div className="p-4 text-mountain-500 text-center">
        Oops! Something went wrong while loading the gallery. Please try again
        later.
      </div>
    );
  }

  if (!isLoading && photos.length === 0 && !isFetchingNextPage) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No posts found matching your criteria.
      </div>
    );
  }

  const effectiveRenderPhoto = renderPhoto ? renderPhoto : ImageRenderer;

  return (
    <div ref={ref} className="relative pb-20">
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
      {isFetchingNextPage && (
        <div className="flex justify-center items-center space-x-2 my-4">
          <CircularProgress size={24} />
          <p>Loading more...</p>
        </div>
      )}
      {isError && !isLoading && photos.length > 0 && (
        <>
          {console.error('Error fetching more posts:', error)}
          <div className="py-4 text-mountain-500 text-center">
            Could not load more posts at this time. Please try again later.
          </div>
        </>
      )}
    </div>
  );
};

export default IGallery;
