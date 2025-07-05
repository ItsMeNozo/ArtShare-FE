import { Collection, Post } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { fetchCollectionsWithPosts } from '../api/collection.api';

export interface UseCollectionsDataResult {
  collections: Collection[];
  allPosts: Post[];
  loading: boolean;
  error: string | null;
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useCollectionsData(): UseCollectionsDataResult {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedCollections = await fetchCollectionsWithPosts();
        setCollections(fetchedCollections);
      } catch (err) {
        console.error('Error loading collection data:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An unknown error occurred loading collections.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const allPosts = useMemo<Post[]>(() => {
    if (loading) return [];

    const postMap = new Map<number, Post>();
    collections.forEach((collection) => {
      (collection.posts || []).forEach((post) => {
        postMap.set(post.id, post);
      });
    });

    return Array.from(postMap.values()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [collections, loading]);

  return {
    collections,
    allPosts,
    loading,
    error,
    setCollections,
    setError,
  };
}
