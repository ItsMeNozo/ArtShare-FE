import { GalleryPhoto } from '@/components/gallery/Gallery';
import { Post } from '@/types';
import { useEffect, useState } from 'react';

interface PostPage {
  data: Post[];
}

export interface UseGalleryPhotosResult {
  photoPages: GalleryPhoto[][];
  isProcessing: boolean;
  processingError: string | null;
}

export function useGalleryPhotos(
  pages: PostPage[] = [],
  key?: number | string | null,
): UseGalleryPhotosResult {
  const [processedPhotoPages, setProcessedPhotoPages] = useState<
    GalleryPhoto[][]
  >([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  useEffect(() => {
    setProcessedPhotoPages([]);
  }, [key]);

  useEffect(() => {
    const transformNewPages = async () => {
      const numProcessedPages = processedPhotoPages.length;

      if (!pages || pages.length <= numProcessedPages) {
        if (pages.length < numProcessedPages) {
          setProcessedPhotoPages([]);
        }
        return;
      }

      setIsProcessing(true);
      setProcessingError(null);

      const newPages = pages.slice(numProcessedPages);

      try {
        const newlyProcessedPages = await Promise.all(
          newPages.map(async (page): Promise<GalleryPhoto[]> => {
            if (!page || !page.data) return [];

            const photosPromises = page.data
              .filter(
                (post) =>
                  post?.thumbnailUrl ||
                  (post?.medias && post.medias.length > 0),
              )
              .map(async (post): Promise<GalleryPhoto | null> => {
                const imageUrl = post?.thumbnailUrl || post?.medias?.[0]?.url;
                if (!imageUrl) return null;

                try {
                  return {
                    src: imageUrl,
                    width:
                      Math.min(post.thumbnailWidth, post.thumbnailHeight) ||
                      256,
                    height: post.thumbnailHeight || 256,
                    key: post.id.toString(),
                    title: post.title || 'Untitled Post',
                    postId: post.id,
                    postLength: post.medias?.length || 0,
                    author: post.user?.username || 'Unknown',
                    profilePictureUrl: post.user?.profilePictureUrl,
                    isMature: post.isMature || false,
                    aiCreated: post.aiCreated || false,
                    likeCount: post.likeCount,
                    commentCount: post.commentCount,
                    viewCount: post.viewCount,
                  };
                } catch (dimensionError) {
                  console.warn(
                    `Error getting dimensions for post ${post.id} (${imageUrl}):`,
                    dimensionError,
                  );
                  return null;
                }
              });

            const resolvedPhotos = await Promise.all(photosPromises);

            return resolvedPhotos.filter(
              (photo): photo is GalleryPhoto => photo !== null,
            );
          }),
        );

        setProcessedPhotoPages((prev) => [...prev, ...newlyProcessedPages]);
      } catch (error) {
        console.error('Error during post transformation:', error);
        setProcessingError('Failed to process new images.');
      } finally {
        setIsProcessing(false);
      }
    };

    transformNewPages();
  }, [pages, processedPhotoPages.length]);

  // Reset gallery photos when the posts array length changes (e.g., after deletion)
  useEffect(() => {
    if (pages.length === 1 && pages[0]?.data) {
      const currentPostsCount = pages[0].data.length;
      const currentPhotosCount = processedPhotoPages[0]?.length || 0;

      // If posts count is different from photos count, reset and re-process
      if (
        currentPostsCount !== currentPhotosCount &&
        processedPhotoPages.length > 0
      ) {
        console.log(
          `[useGalleryPhotos] Posts count changed: ${currentPhotosCount} -> ${currentPostsCount}, resetting gallery`,
        );
        setProcessedPhotoPages([]);
      }
    }
  }, [pages, processedPhotoPages]);

  useEffect(() => {
    if (pages.length > 0 && pages.length < processedPhotoPages.length) {
      setProcessedPhotoPages([]);
    }
  }, [pages, processedPhotoPages.length]);

  return {
    photoPages: processedPhotoPages,
    isProcessing,
    processingError,
  };
}
