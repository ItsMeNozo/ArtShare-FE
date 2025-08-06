import Loading from '@/components/loading/Loading';
import { CollectionGallery } from '@/features/collection/components/CollectionGallery';
import { CollectionSlider } from '@/features/collection/components/CollectionSlider';
import { useCollectionsData } from '@/features/collection/hooks/useCollectionsData';
import { useGalleryPhotos } from '@/features/collection/hooks/useGalleryPhotos';
import {
  CollectionDisplayInfo,
  SelectedCollectionId,
  SliderItem,
} from '@/features/collection/types/collection';
import { Post } from '@/types';
import { Box, Typography } from '@mui/material';
import React, { useMemo } from 'react';

interface UserPublicCollectionsProps {
  username: string;
}

const UserPublicCollections: React.FC<UserPublicCollectionsProps> = ({
  username,
}) => {
  const [selectedCollectionId, setSelectedCollectionId] =
    React.useState<SelectedCollectionId>('all');

  const {
    collections,
    error: collectionsError,
    isLoading: loadingCollections,
  } = useCollectionsData(username);

  const activeCollectionId = useMemo<SelectedCollectionId | null>(() => {
    if (selectedCollectionId !== null) {
      return selectedCollectionId;
    }

    if (!loadingCollections && collections.length >= 0) {
      return 'all';
    }

    return null;
  }, [collections, loadingCollections, selectedCollectionId]);

  const handleCollectionSelect = (id: SelectedCollectionId) => {
    setSelectedCollectionId(id);
  };

  const publicCollections = useMemo(() => {
    return collections.filter((c) => !c.isPrivate);
  }, [collections]);

  const allPublicPosts = useMemo<Post[]>(() => {
    if (loadingCollections || !publicCollections) {
      return [];
    }
    const posts = publicCollections.flatMap((col) => col.posts || []);
    const uniqueMap = new Map<number, Post>();
    posts.forEach((post) => uniqueMap.set(post.id, post));
    return Array.from(uniqueMap.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [publicCollections, loadingCollections]);

  const currentCollection = useMemo(
    () =>
      typeof selectedCollectionId === 'number'
        ? publicCollections.find((c) => c.id === selectedCollectionId)
        : undefined,
    [publicCollections, selectedCollectionId],
  );

  const filteredPosts = useMemo<Post[]>(() => {
    if (loadingCollections) return [];
    if (activeCollectionId === 'all') {
      return allPublicPosts;
    }
    return currentCollection?.posts || [];
  }, [
    activeCollectionId,
    currentCollection?.posts,
    allPublicPosts,
    loadingCollections,
  ]);

  const pages = useMemo(() => {
    return filteredPosts ? [{ data: filteredPosts }] : [];
  }, [filteredPosts]);

  const { photoPages, isProcessing: isProcessingPhotos } = useGalleryPhotos(
    pages,
    activeCollectionId,
  );

  const allPhotosFlat = useMemo(() => photoPages.flat(), [photoPages]);

  const isGalleryLoading =
    loadingCollections || (isProcessingPhotos && allPhotosFlat.length === 0);

  const collectionsForDisplay = useMemo<CollectionDisplayInfo[]>(() => {
    if (loadingCollections) return [];
    return publicCollections.map((collection) => {
      const sortedPosts = [...(collection.posts || [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      const newestPostInCollection = sortedPosts[0];
      const thumbnailUrl =
        newestPostInCollection?.thumbnailUrl ||
        newestPostInCollection?.medias?.[0]?.url;
      return { ...collection, thumbnailUrl, posts: collection.posts || [] };
    });
  }, [publicCollections, loadingCollections]);

  const sliderData = useMemo<SliderItem[]>(() => {
    const items: SliderItem[] = [];
    const allPostsItem: SliderItem = {
      type: 'all',
      thumbnailUrl:
        allPublicPosts[0]?.thumbnailUrl || allPublicPosts[0]?.medias?.[0]?.url,
      count: allPublicPosts.length,
    };
    items.push(allPostsItem);

    const collectionItems: SliderItem[] = collectionsForDisplay.map(
      (collection) => ({
        type: 'collection',
        id: collection.id,
        name: collection.name,
        isPrivate: collection.isPrivate,
        thumbnailUrl: collection.thumbnailUrl,
        count: collection.posts?.length ?? 0,
      }),
    );

    items.push(...collectionItems);
    return items;
  }, [collectionsForDisplay, allPublicPosts]);

  const galleryTitle = useMemo(() => {
    if (activeCollectionId === 'all') return 'All';
    if (currentCollection) return currentCollection.name;
    return 'Loading...';
  }, [activeCollectionId, currentCollection]);

  if (loadingCollections) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Loading />
      </Box>
    );
  }

  if (collectionsError) {
    return (
      <Typography color="error" sx={{ textAlign: 'center', p: 4 }}>
        Failed to load collections.
      </Typography>
    );
  }

  if (publicCollections.length === 0) {
    return (
      <Typography sx={{ textAlign: 'center', p: 4 }}>
        This user has no public collections.
      </Typography>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <CollectionSlider
          items={sliderData}
          selectedId={selectedCollectionId}
          loading={loadingCollections}
          onSelect={handleCollectionSelect}
          onAdd={() => {}}
          onRemove={() => {}}
          isReadOnly={true}
        />
      </Box>

      <Box>
        <Typography variant="h6">{galleryTitle}</Typography>
        <Typography variant="body2" color="text.secondary">
          {allPhotosFlat.length} items
        </Typography>
      </Box>

      <Box sx={{ minHeight: '60vh' }}>
        <CollectionGallery
          photoPages={photoPages}
          allPhotosFlat={allPhotosFlat}
          isLoading={isGalleryLoading}
          isError={false}
          error={null}
          onRemovePost={() => {}}
          selectedCollectionId={selectedCollectionId}
          isReadOnly={true}
        />
      </Box>
    </Box>
  );
};

export default UserPublicCollections;
