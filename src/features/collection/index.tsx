import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  ToggleButton,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { SearchInput } from '@/components/SearchInput';
import { Collection, Post } from '@/types';
import { FiGlobe as AllIcon, FiLock as LockIcon } from 'react-icons/fi';
import {
  deleteCollection,
  removePostFromCollection,
  updateCollection,
} from './api/collection.api';
import { CollectionGallery } from './components/CollectionGallery';
import { CollectionSlider } from './components/CollectionSlider';
import { CollectionTitle } from './components/CollectionTitle';
import { CreateCollectionDialog } from './components/CreateCollectionDialog';
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isTitleEditing, setIsTitleEditing] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [collectionToDelete, setCollectionToDelete] =
    useState<Collection | null>(null);
  const [showOnlyPrivate, setShowOnlyPrivate] = useState<boolean>(false);

  const {
    collections,
    loading: loadingCollections,
    error: collectionsError,
    setCollections,
    setError: setCollectionsError,
  } = useCollectionsData();

  const currentCollection = useMemo<Collection | undefined>(() => {
    return typeof selectedCollectionId === 'number'
      ? collections.find((c) => c.id === selectedCollectionId)
      : undefined;
  }, [collections, selectedCollectionId]);

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

  const {
    galleryPhotos,
    isProcessing: isProcessingPhotos,
    processingError: photosError,
  } = useGalleryPhotos(filteredPosts);

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

  const handleCollectionSelect = useCallback(
    (id: SelectedCollectionId) => {
      setSelectedCollectionId(id);
      setActionError(null);
      setCollectionsError(null);
    },
    [setCollectionsError],
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleAddCollectionClick = useCallback(() => {
    setIsCreateDialogOpen(true);
    setActionError(null);
  }, []);

  const handleCloseCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(false);
  }, []);

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setCollectionToDelete(null);
  };

  const handleCreateCollection = useCallback(
    async (newCollection: Collection) => {
      setActionError(null);

      setCollections((prevCollections) => [...prevCollections, newCollection]);

      setSelectedCollectionId(newCollection.id);

      handleCloseCreateDialog();
    },
    [setCollections, handleCloseCreateDialog],
  );

  const handleEditRequest = useCallback(() => {
    setActionError(null);
    setIsTitleEditing(true);
  }, []);

  const handleEditCancel = useCallback(() => {
    setIsTitleEditing(false);
  }, []);

  const handleSaveTitle = useCallback(
    async (newName: string): Promise<void> => {
      if (!currentCollection) return;

      setActionError(null);

      try {
        const updatedCollectionFromApi = await updateCollection(
          currentCollection.id,
          { name: newName },
        );

        setCollections((prevCollections) =>
          prevCollections.map((col) =>
            col.id === updatedCollectionFromApi.id
              ? { ...col, name: updatedCollectionFromApi.name }
              : col,
          ),
        );

        setIsTitleEditing(false);
      } catch (err) {
        console.error('Error renaming collection via API:', err);
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to rename collection.';

        setActionError(errorMsg);

        throw err;
      }
    },
    [currentCollection, setCollections, setActionError],
  );

  const handleSetPrivacy = useCallback(
    async (isPrivate: boolean): Promise<void> => {
      if (!currentCollection) return;

      setActionError(null);

      try {
        const updatedCollectionFromApi = await updateCollection(
          currentCollection.id,
          { isPrivate },
        );

        setCollections((prevCollections) =>
          prevCollections.map((col) =>
            col.id === updatedCollectionFromApi.id
              ? { ...col, isPrivate: updatedCollectionFromApi.isPrivate }
              : col,
          ),
        );
      } catch (err) {
        console.error('Error updating collection privacy via API:', err);
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'Failed to update collection privacy.';

        setActionError(errorMsg);

        throw err;
      }
    },
    [currentCollection, setCollections, setActionError],
  );

  const handleRemovePost = useCallback(
    async (postId: number) => {
      if (typeof selectedCollectionId !== 'number') return;

      setActionError(null);
      const originalCollections = collections;

      setCollections((prevCollections) =>
        prevCollections.map((col) => {
          if (col.id === selectedCollectionId) {
            return {
              ...col,
              posts: (col.posts || []).filter((p) => p.id !== postId),
            };
          }
          return col;
        }),
      );

      try {
        await removePostFromCollection(selectedCollectionId, postId);
      } catch (err) {
        console.error(`Error removing post ${postId}:`, err);
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to remove post.';
        setActionError(errorMsg);
        setCollections(originalCollections);
        alert(`Error removing post: ${errorMsg}`);
      }
    },
    [selectedCollectionId, collections, setCollections],
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

      setCollectionToDelete(collection);
      setIsDeleteDialogOpen(true);
      setActionError(null);
    },
    [collections],
  );

  const handleConfirmDeleteCollection = useCallback(async () => {
    if (!collectionToDelete) return;

    const collectionIdToRemove = collectionToDelete.id;
    const originalCollections = [...collections];

    handleCloseDeleteDialog();

    setCollections((prev) => prev.filter((c) => c.id !== collectionIdToRemove));

    if (selectedCollectionId === collectionIdToRemove) {
      setSelectedCollectionId('all');
    }

    try {
      await deleteCollection(collectionIdToRemove);

      console.log(`Collection ${collectionIdToRemove} deleted successfully.`);
    } catch (err) {
      console.error('Error deleting collection:', err);
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to delete collection.';
      setActionError(errorMsg);

      setCollections(originalCollections);

      if (
        selectedCollectionId === 'all' &&
        originalCollections.some((c) => c.id === collectionIdToRemove)
      ) {
        setSelectedCollectionId(collectionIdToRemove);
      }
    }
  }, [
    collectionToDelete,
    collections,
    setCollections,
    selectedCollectionId,
    setActionError,
  ]);

  const galleryTitle = useMemo(() => {
    if (selectedCollectionId === 'all') {
      return 'All';
    }
    if (currentCollection) {
      return currentCollection.name;
    }
    if (loadingCollections) {
      return 'Loading...';
    }
    return 'All Collections';
  }, [selectedCollectionId, currentCollection, loadingCollections]);

  const galleryItemCountText = useMemo(() => {
    if (loadingCollections) return 'Loading...';
    if (isProcessingPhotos) return 'Processing...';
    return `${galleryPhotos.length} items`;
  }, [loadingCollections, isProcessingPhotos, galleryPhotos.length]);

  const isGalleryLoading = loadingCollections || isProcessingPhotos;
  const displayError = collectionsError || photosError || actionError;

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
          isLoading={
            loadingCollections &&
            !currentCollection &&
            selectedCollectionId !== 'all'
          }
          error={actionError}
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
        error={displayError && !isGalleryLoading ? displayError : null}
        onRemovePost={handleRemovePost}
        selectedCollectionId={selectedCollectionId}
      />

      <CreateCollectionDialog
        open={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onSuccess={handleCreateCollection}
        existingCollectionNames={collections.map((c) => c.name)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-collection-dialog-title"
        aria-describedby="delete-collection-dialog-description"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <DialogTitle id="delete-collection-dialog-title">
          Confirm Delete Collection
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-collection-dialog-description">
            Are you sure you want to delete the collection
            <strong>"{collectionToDelete?.name || 'this collection'}"</strong>?
            <br />
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteCollection}
            variant="contained"
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CollectionPage;
