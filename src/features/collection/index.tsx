import {
  Box,
  Container,
  Stack,
  ToggleButton,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import ConfirmationDialog from '@/components/ConfirmationDialog';
import { SearchInput } from '@/components/SearchInput';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';
import { Collection, Post } from '@/types';
import { FiGlobe as AllIcon, FiLock as LockIcon } from 'react-icons/fi';
import { CollectionGallery } from './components/CollectionGallery';
import { CollectionSlider } from './components/CollectionSlider';
import { CollectionTitle } from './components/CollectionTitle';
import { CreateCollectionDialog } from './components/CreateCollectionDialog';
import {
  useCreateCollection,
  useDeleteCollection,
  useRemovePostFromCollection,
  useUpdateCollection,
} from './hooks/useCollectionMutations';
import { useCollectionsData } from './hooks/useCollectionsData';
import { useGalleryPhotos } from './hooks/useGalleryPhotos';
import {
  CollectionDisplayInfo,
  SelectedCollectionId,
  SliderItem,
  SliderItemCollection,
} from './types/collection';

const CollectionPage: React.FC = () => {
  const [selectedCollectionId, setSelectedCollectionId] =
    useState<SelectedCollectionId>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isTitleEditing, setIsTitleEditing] = useState<boolean>(false);
  const [showOnlyPrivate, setShowOnlyPrivate] = useState<boolean>(false);

  const {
    isDialogOpen: isDeleteDialogOpen,
    itemToConfirm: collectionToDelete,
    openDialog: openDeleteDialog,
    closeDialog: closeDeleteDialog,
  } = useConfirmationDialog<Collection>();

  const {
    collections,
    error: collectionsError,
    isLoading: loadingCollections,
  } = useCollectionsData();

  const createCollectionMutation = useCreateCollection();
  const updateCollectionMutation = useUpdateCollection();
  const deleteCollectionMutation = useDeleteCollection();
  const removePostMutation = useRemovePostFromCollection();

  const currentCollection = useMemo<Collection | undefined>(
    () =>
      typeof selectedCollectionId === 'number'
        ? collections.find((c) => c.id === selectedCollectionId)
        : undefined,
    [collections, selectedCollectionId],
  );

  const existingCollectionNames = useMemo(() => {
    return collections.map((col) => col.name);
  }, [collections]);

  const allPostsData = useMemo(() => {
    if (loadingCollections || !collections) {
      return {
        allPublicPosts: [],
        allPrivatePosts: [],
        allPostsCombined: [],
        newestPublicThumbnail: undefined,
        newestPrivateThumbnail: undefined,
        newestCombinedThumbnail: undefined,
      };
    }

    const publicCollections = collections.filter((c) => !c.isPrivate);
    const publicPosts = publicCollections.flatMap((col) => col.posts || []);
    const uniquePublicMap = new Map<number, Post>();
    publicPosts.forEach((post) => uniquePublicMap.set(post.id, post));
    const allPublicPosts = Array.from(uniquePublicMap.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const newestPublicPost = allPublicPosts[0];
    const pubThumbnail =
      newestPublicPost?.thumbnailUrl || newestPublicPost?.medias?.[0]?.url;

    const privateCollections = collections.filter((c) => c.isPrivate);
    const privatePosts = privateCollections.flatMap((col) => col.posts || []);
    const uniquePrivateMap = new Map<number, Post>();
    privatePosts.forEach((post) => uniquePrivateMap.set(post.id, post));
    const allPrivatePosts = Array.from(uniquePrivateMap.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const newestPrivatePost = allPrivatePosts[0];
    const privThumbnail =
      newestPrivatePost?.thumbnailUrl || newestPrivatePost?.medias?.[0]?.url;

    const combinedMap = new Map<number, Post>();
    [...allPublicPosts, ...allPrivatePosts].forEach((post) => {
      combinedMap.set(post.id, post);
    });
    const allPostsCombined = Array.from(combinedMap.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const newestCombinedPost = allPostsCombined[0];
    const combinedThumbnail =
      newestCombinedPost?.thumbnailUrl || newestCombinedPost?.medias?.[0]?.url;

    return {
      allPublicPosts,
      allPrivatePosts,
      allPostsCombined,
      newestPublicThumbnail: pubThumbnail,
      newestPrivateThumbnail: privThumbnail,
      newestCombinedThumbnail: combinedThumbnail,
    };
  }, [collections, loadingCollections]);

  const filteredPosts = useMemo<Post[]>(() => {
    if (loadingCollections) return [];

    if (selectedCollectionId === 'all') {
      return showOnlyPrivate
        ? allPostsData.allPrivatePosts
        : allPostsData.allPostsCombined;
    } else {
      return currentCollection?.posts || [];
    }
  }, [
    selectedCollectionId,
    currentCollection,
    showOnlyPrivate,
    allPostsData,
    loadingCollections,
  ]);

  const { galleryPhotos, isProcessing: isProcessingPhotos } =
    useGalleryPhotos(filteredPosts);

  const collectionsForDisplay = useMemo<CollectionDisplayInfo[]>(() => {
    if (loadingCollections) return [];
    return collections.map((collection) => {
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
  }, [collections, loadingCollections]);

  const combinedSliderData = useMemo<SliderItem[]>(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const items: SliderItem[] = [];

    items.push({ type: 'add' });

    const allPostsTitle = 'all';
    if (!normalizedQuery || allPostsTitle.includes(normalizedQuery)) {
      const countForAllPosts = showOnlyPrivate
        ? allPostsData.allPrivatePosts.length
        : allPostsData.allPostsCombined.length;

      const thumbnailForAllPosts = showOnlyPrivate
        ? allPostsData.newestPrivateThumbnail
        : allPostsData.newestCombinedThumbnail;

      items.push({
        type: 'all',
        thumbnailUrl: countForAllPosts > 0 ? thumbnailForAllPosts : undefined,
        count: countForAllPosts,
      });
    }

    const filteredCollectionItems: SliderItemCollection[] =
      collectionsForDisplay
        .filter((collection) => {
          const matchesVisibility = !showOnlyPrivate || collection.isPrivate;
          const matchesSearch =
            !normalizedQuery ||
            collection.name.toLowerCase().includes(normalizedQuery);
          return matchesVisibility && matchesSearch;
        })
        .map((collection) => ({
          type: 'collection',
          id: collection.id,
          name: collection.name,
          isPrivate: collection.isPrivate,
          thumbnailUrl: collection.thumbnailUrl,
          count: collection.posts?.length ?? 0,
        }));

    items.push(...filteredCollectionItems);

    const addIndex = items.findIndex((item) => item.type === 'add');
    const allPostsIndex = items.findIndex((item) => item.type === 'all');
    if (allPostsIndex > addIndex + 1) {
      const [allPostsItem] = items.splice(allPostsIndex, 1);
      items.splice(addIndex + 1, 0, allPostsItem);
    }

    return items;
  }, [collectionsForDisplay, allPostsData, searchQuery, showOnlyPrivate]);

  useEffect(() => {
    if (!showOnlyPrivate) {
      return;
    }

    if (currentCollection && !currentCollection.isPrivate) {
      setSelectedCollectionId('all');
    }
  }, [showOnlyPrivate, currentCollection, setSelectedCollectionId]);

  const handleTogglePrivateFilter = useCallback(() => {
    setShowOnlyPrivate((prev) => !prev);
  }, []);

  const handleCollectionSelect = useCallback((id: SelectedCollectionId) => {
    setSelectedCollectionId(id);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleAddCollectionClick = useCallback(() => {
    setIsCreateDialogOpen(true);
  }, []);

  const handleCloseCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(false);
  }, []);

  const handleCreateCollection = useCallback(
    async (newCollectionData: { name: string; isPrivate: boolean }) => {
      createCollectionMutation.mutate(newCollectionData, {
        onSuccess: (newCollection) => {
          setSelectedCollectionId(newCollection.id);
          handleCloseCreateDialog();
        },
      });
    },
    [createCollectionMutation],
  );

  const handleEditRequest = useCallback(() => {
    setIsTitleEditing(true);
  }, []);

  const handleEditCancel = useCallback(() => {
    setIsTitleEditing(false);
  }, []);

  const handleSaveTitle = useCallback(
    async (newName: string) => {
      if (!currentCollection) return;
      await updateCollectionMutation.mutateAsync({
        id: currentCollection.id,
        data: { name: newName },
      });
      setIsTitleEditing(false);
    },
    [currentCollection, updateCollectionMutation],
  );

  const handleSetPrivacy = useCallback(
    async (isPrivate: boolean) => {
      if (!currentCollection) return;
      await updateCollectionMutation.mutateAsync({
        id: currentCollection.id,
        data: { isPrivate },
      });
    },
    [currentCollection, updateCollectionMutation],
  );

  const handleRemovePost = useCallback(
    (postId: number) => {
      if (typeof selectedCollectionId !== 'number') return;
      removePostMutation.mutate({ collectionId: selectedCollectionId, postId });
    },
    [selectedCollectionId, removePostMutation],
  );

  const handleRemoveCollection = useCallback(
    (collectionIdToRemove: number) => {
      const collection = collections.find((c) => c.id === collectionIdToRemove);
      if (!collection) {
        console.warn(
          'Tried to initiate delete for non-existent collection:',
          collectionIdToRemove,
        );
        return;
      }
      openDeleteDialog(collection);
    },
    [collections, openDeleteDialog],
  );

  const handleConfirmDeleteCollection = useCallback(() => {
    if (!collectionToDelete) return;
    deleteCollectionMutation.mutate(collectionToDelete.id, {
      onSuccess: () => {
        if (selectedCollectionId === collectionToDelete.id) {
          setSelectedCollectionId('all');
        }
        closeDeleteDialog();
      },
    });
  }, [
    collectionToDelete,
    deleteCollectionMutation,
    selectedCollectionId,
    closeDeleteDialog,
  ]);

  const galleryTitle = useMemo(() => {
    if (selectedCollectionId === 'all') return 'All';
    if (currentCollection) return currentCollection.name;
    return 'Loading...';
  }, [selectedCollectionId, currentCollection]);

  const galleryItemCountText = `${galleryPhotos.length} items`;

  const isGalleryLoading = loadingCollections || isProcessingPhotos;
  const anyMutationError =
    createCollectionMutation.error ||
    updateCollectionMutation.error ||
    deleteCollectionMutation.error ||
    removePostMutation.error;
  const displayError = collectionsError || anyMutationError;

  return (
    <Container maxWidth="xl" className="h-screen py-3">
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        spacing={{ xs: 2, md: 3 }}
        mb={4}
        flexWrap="wrap"
      >
        <Typography variant="h6" component="h1" fontWeight="normal" noWrap>
          Collections
        </Typography>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Tooltip
            title={
              showOnlyPrivate
                ? 'Show All Collections'
                : 'Show Only Private Collections'
            }
          >
            <ToggleButton
              value="privateFilter"
              selected={showOnlyPrivate}
              onChange={handleTogglePrivateFilter}
              aria-label="Toggle private collection filter"
              size="small"
              sx={{
                height: 'fit-content',
                textTransform: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.paper',
              }}
            >
              {!showOnlyPrivate ? (
                <LockIcon fontSize={16} />
              ) : (
                <AllIcon fontSize={16} />
              )}
              <Typography
                variant="caption"
                sx={{
                  ml: 1,
                  display: { xs: 'none', sm: 'inline' },
                  lineHeight: 1,
                }}
              >
                {showOnlyPrivate ? 'All' : 'Private Only'}
              </Typography>
            </ToggleButton>
          </Tooltip>
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            placeholder="Search collections..."
          />
        </Stack>
      </Stack>

      {/* Slider */}
      <Box mb={6}>
        <CollectionSlider
          items={combinedSliderData}
          selectedId={selectedCollectionId}
          loading={loadingCollections}
          onSelect={handleCollectionSelect}
          onAdd={handleAddCollectionClick}
          onRemove={handleRemoveCollection}
        />
      </Box>

      {/* Title Section */}
      <Box mb={4}>
        <CollectionTitle
          title={galleryTitle}
          itemCountText={galleryItemCountText}
          isEditable={typeof selectedCollectionId === 'number'}
          isPrivate={!!currentCollection?.isPrivate}
          isLoading={updateCollectionMutation.isPending}
          error={updateCollectionMutation.error?.message ?? null}
          onSave={handleSaveTitle}
          onSetPrivacy={handleSetPrivacy}
          isEditing={isTitleEditing}
          onEditRequest={handleEditRequest}
          onEditCancel={handleEditCancel}
          existingCollectionNames={existingCollectionNames}
        />
      </Box>

      {/* Gallery */}
      <CollectionGallery
        photos={galleryPhotos}
        isLoading={isGalleryLoading}
        isError={!!displayError && !isGalleryLoading}
        error={displayError ? (displayError as Error).message : null}
        onRemovePost={handleRemovePost}
        selectedCollectionId={selectedCollectionId}
      />

      <CreateCollectionDialog
        open={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onSuccess={handleCreateCollection}
        existingCollectionNames={collections.map((c) => c.name)}
        isSubmitting={createCollectionMutation.isPending}
        error={createCollectionMutation.error?.message}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDeleteCollection}
        title="Confirm Delete Collection"
        contentText={`Are you sure you want to delete the collection "${
          collectionToDelete?.name || 'this collection'
        }"?`}
        confirmButtonText="Delete"
        isConfirming={deleteCollectionMutation.isPending}
      />
    </Container>
  );
};

export default CollectionPage;
