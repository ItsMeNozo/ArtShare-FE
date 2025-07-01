import { PaginatedResponse } from '@/api/types/paginated-response.type';
import { GalleryPhoto } from '@/components/gallery/Gallery';
import { Post } from '@/types';

interface TransformedPage {
  photos: GalleryPhoto[];
  hasNextPage: boolean;
  page: number;
}

export const postsToPhotos = async (
  postsResponse: PaginatedResponse<Post>,
): Promise<TransformedPage> => {
  const photoPromises = (postsResponse.data ?? []).map(transformPostToPhoto);
  const resolvedPhotos = await Promise.all(photoPromises);
  const validPhotos = resolvedPhotos.filter((photo) => photo !== null);

  return {
    photos: validPhotos,
    hasNextPage: postsResponse.hasNextPage,
    page: postsResponse.page,
  };
};

const transformPostToPhoto = (post: Post): Promise<GalleryPhoto | null> => {
  return new Promise((resolve) => {
    const thumbnailUrl =
      post.thumbnail_url ||
      post.medias[0]?.url ||
      'https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2247726673.jpg';
    const image = new Image();
    image.src = thumbnailUrl;

    image.onload = () => {
      resolve({
        // Properties required by react-photo-album
        key: post.id.toString(),
        src: thumbnailUrl,
        width: image.naturalWidth,
        height: image.naturalHeight,

        title: post.title || '',
        author: post.user?.username || 'Unknown Author',
        postLength: post.medias?.length ?? 0,
        postId: post.id,
        is_mature: post.is_mature,
        ai_created: post.ai_created,
        like_count: post.like_count,
        comment_count: post.comment_count,
        view_count: post.view_count,
      });
    };

    image.onerror = () => {
      console.error(`Failed to load image for post: ${post.id}`);
      resolve(null);
    };
  });
};
