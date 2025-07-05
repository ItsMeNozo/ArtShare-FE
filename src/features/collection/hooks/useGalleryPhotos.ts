import { GalleryPhoto } from '@/components/gallery/Gallery';
import { Post } from '@/types';
import { getMediaDimensions } from '@/utils/helpers/gallery.helper';
import { useEffect, useState } from 'react';

export interface UseGalleryPhotosResult {
  galleryPhotos: GalleryPhoto[];
  isProcessing: boolean;
  processingError: string | null;
}

export function useGalleryPhotos(posts: Post[]): UseGalleryPhotosResult {
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  useEffect(() => {
    const transformPosts = async () => {
      if (posts.length === 0) {
        setGalleryPhotos([]);
        setIsProcessing(false);
        setProcessingError(null);
        return;
      }

      setIsProcessing(true);
      setProcessingError(null);

      try {
        const photosPromises = posts
          .filter(
            (post) =>
              post.thumbnailUrl || (post.medias && post.medias.length > 0),
          )
          .map(async (post): Promise<GalleryPhoto | null> => {
            const imageUrl = post.thumbnailUrl || post.medias?.[0]?.url;
            if (!imageUrl) return null;

            try {
              const { width, height } = await getMediaDimensions(imageUrl);
              return {
                src: imageUrl || '',
                width,
                height,
                key: post.id.toString(),
                title: post.title || '',
                postId: post.id,
                postLength: post.medias?.length || 0,
                author: post.user.username,
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
        const validPhotos = resolvedPhotos.filter(
          (photo): photo is GalleryPhoto => photo !== null,
        );
        setGalleryPhotos(validPhotos);
      } catch (error) {
        console.error('Error during post transformation:', error);
        setProcessingError('Failed to process post images.');
        setGalleryPhotos([]);
      } finally {
        setIsProcessing(false);
      }
    };

    transformPosts();
  }, [posts]);

  return { galleryPhotos, isProcessing, processingError };
}
