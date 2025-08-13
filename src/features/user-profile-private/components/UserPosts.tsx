import { useUser } from '@/contexts/user';
import { useGalleryPhotos } from '@/features/collection/hooks/useGalleryPhotos';
import { useEffect, useMemo } from 'react';
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
    isFetching,
  } = useGetUserPosts(username);

  // Debug logging to track post changes
  useEffect(() => {
    console.log(`[UserPosts] Posts count for ${username}:`, posts.length);
    console.log(
      `[UserPosts] Loading: ${loadingPosts}, Fetching: ${isFetching}`,
    );
  }, [posts.length, loadingPosts, isFetching, username]);

  const pages = useMemo(() => (posts ? [{ data: posts }] : []), [posts]);
  const { photoPages, isProcessing, processingError } = useGalleryPhotos(
    pages,
    username,
  );
  const allPhotosFlat = useMemo(() => photoPages.flat(), [photoPages]);

  const handlePostDeleted = (postId: number) => {
    // The actual deletion is handled by the useDeletePost hook in the components
    // This callback is just for any additional UI updates if needed
    console.log(`[UserPosts] Post ${postId} deleted successfully`);
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
