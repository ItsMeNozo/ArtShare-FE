import { useUser } from '@/contexts/user';
import { useGalleryPhotos } from '@/features/collection/hooks/useGalleryPhotos';
import { Post } from '@/types';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserPosts } from '../api/get-posts-by-user';
import { UserPostGallery } from './UserPostGallery';

const UserPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { username } = useParams<{ username: string }>();
  const { user } = useUser();

  const { galleryPhotos, isProcessing, processingError } =
    useGalleryPhotos(posts);

  useEffect(() => {
    if (!username) {
      setLoadingPosts(false);
      return;
    }

    const loadUserPosts = async () => {
      try {
        setLoadingPosts(true);
        setFetchError(null);
        const userPosts = await fetchUserPosts(username, 1);
        setPosts(userPosts);
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setFetchError('Failed to fetch user posts.');
      } finally {
        setLoadingPosts(false);
      }
    };

    loadUserPosts();
  }, [username]);

  const handlePostDeleted = (postId: number) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  if (!username) {
    return null;
  }

  const isOwner = user?.username === username;

  const isLoading = loadingPosts || isProcessing;
  const isError = !!fetchError || !!processingError;
  const error = fetchError || processingError;

  return (
    <UserPostGallery
      photos={galleryPhotos}
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
