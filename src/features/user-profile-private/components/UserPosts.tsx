import { useUser } from '@/contexts/user';
import { useGalleryPhotos } from '@/features/collection/hooks/useGalleryPhotos';
import { useDeletePost } from '@/features/post/hooks/useDeletePost';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useGetUserPosts } from '../hooks/useGetUserPosts';
import { UserPostGallery } from './UserPostGallery';

const UserPosts = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useUser();

  const {
    data: posts = [],
    isLoading: loadingPosts,
    error: fetchError,
  } = useGetUserPosts(username);

  const { mutate: deletePost } = useDeletePost({
    username: username,
    onError: (errorMessage) => {
      console.error(errorMessage);
    },
  });

  const pages = useMemo(() => (posts ? [{ data: posts }] : []), [posts]);
  const { photoPages, isProcessing, processingError } = useGalleryPhotos(pages, username);
  const allPhotosFlat = useMemo(() => photoPages.flat(), [photoPages]);

  const handlePostDeleted = (postId: number) => {
    deletePost(postId);
  };

  if (!username) {
    return null;
  }

  const isOwner = user?.username === username;
  const isLoading =
    loadingPosts || (isProcessing && allPhotosFlat.length === 0);
  const isError = !!fetchError || !!processingError;
  const error = (fetchError?.message || processingError) as string | null;

  return (
    <UserPostGallery
      photoPages={photoPages}
      allPhotosFlat={allPhotosFlat}
      isLoading={isLoading}
      isError={isError}
      error={error}
      username={username}
      isOwner={isOwner}
      onPostDeleted={handlePostDeleted}
    />
  );
};

export default UserPosts;
