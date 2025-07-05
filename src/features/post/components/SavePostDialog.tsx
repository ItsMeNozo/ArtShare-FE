import {
  Alert,
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
  Skeleton,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { CheckIcon, PlusCircleIcon, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  addPostToCollection,
  removePostFromCollection,
} from '@/features/collection/api/collection.api';
import { SearchInput } from '../../../components/SearchInput';
import { fetchCollectionsForDialog } from '../api/collection.api';

export interface SavePostDialogProps {
  open: boolean;
  onClose: () => void;
  postId: number;
  initialCollections?: DialogCollection[];
  onNavigateToCreate: () => void;
  createDisabled?: boolean;
  createDisabledReason?: string;
}

export interface DialogCollection {
  id: number;
  name: string;
  thumbnailUrl?: string;
  postIds: number[];
}

export const SavePostDialog = (props: SavePostDialogProps) => {
  const {
    onClose,
    open,
    postId,
    onNavigateToCreate,
    createDisabled = false,
    createDisabledReason = '',
  } = props;
  const [searchQuery, setSearchQuery] = useState('');
  const [collections, setCollections] = useState<DialogCollection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [togglingCollectionId, setTogglingCollectionId] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (open) {
      const loadCollections = async () => {
        setIsLoading(true);
        setFetchError(null);
        setToggleError(null);
        setCollections([]);
        setSearchQuery('');
        setTogglingCollectionId(null);

        try {
          console.log('Fetching collections for dialog...');
          const fetchedData = await fetchCollectionsForDialog();
          setCollections(fetchedData);
          console.log('Collections fetched:', fetchedData);
        } catch (err) {
          console.error('Error in fetchCollectionsForDialog:', err);
          const errorMsg =
            err instanceof Error ? err.message : 'Could not load collections.';
          setFetchError(errorMsg);
        } finally {
          setIsLoading(false);
        }
      };

      loadCollections();
    }
  }, [open]);

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleClose = () => {
    if (!togglingCollectionId && !isLoading) {
      onClose();
    }
  };

  const handleTogglePostInCollection = async (collectionId: number) => {
    setToggleError(null);
    setTogglingCollectionId(collectionId);

    const collectionIndex = collections.findIndex((c) => c.id === collectionId);
    if (collectionIndex === -1) {
      console.error('Collection not found locally:', collectionId);
      setTogglingCollectionId(null);
      setToggleError('An unexpected error occurred. Collection not found.');
      return;
    }

    const originalCollections = [...collections];
    const collection = collections[collectionIndex];
    const isCurrentlyAdded = collection.postIds.includes(postId);
    const optimisticAction = isCurrentlyAdded ? 'remove' : 'add';

    setCollections((prevCollections) =>
      prevCollections.map((col) => {
        if (col.id === collectionId) {
          const newPostIds = isCurrentlyAdded
            ? col.postIds.filter((id) => id !== postId)
            : [...col.postIds, postId];
          return { ...col, postIds: newPostIds };
        }
        return col;
      }),
    );

    try {
      if (optimisticAction === 'add') {
        await addPostToCollection(collectionId, postId);
      } else {
        await removePostFromCollection(collectionId, postId);
      }
      console.log(
        `API: ${optimisticAction === 'add' ? 'Added' : 'Removed'} post ${postId} successfully.`,
      );
    } catch (err) {
      console.error(
        `API Error ${optimisticAction === 'add' ? 'adding to' : 'removing from'} collection ${collectionId}:`,
        err,
      );
      const errorMsg =
        err instanceof Error ? err.message : `Failed to update collection.`;
      setToggleError(errorMsg);

      setCollections(originalCollections);
    } finally {
      setTogglingCollectionId(null);
    }
  };

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCloseSnackbar = () => {
    setToggleError(null);
  };

  const descriptionElementRef = useRef<HTMLDivElement>(null);

  const showLoadingSkeleton = isLoading;
  const showFetchError = !isLoading && !!fetchError;
  const showContent = !isLoading && !fetchError;

  if (!open) {
    return null;
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll="paper"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          id="scroll-dialog-title"
          sx={{
            m: 0,
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Add to Collection</span>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            disabled={!!togglingCollectionId || isLoading}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>

        {/* Content Area */}
        <DialogContent
          dividers={true}
          sx={{
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '300px',
            width: '100%',
          }}
        >
          {/* Search Input */}
          <Box sx={{ p: { xs: 2, sm: 3 }, pb: 2 }}>
            <SearchInput
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              placeholder="Search collections..."
            />
          </Box>

          {/* Collection List */}
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
            component="div"
            sx={{
              overflowY: 'auto',
              flexGrow: 1,
              p: 0,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* === Loading State === */}
            {showLoadingSkeleton && (
              <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
                {[...Array(3)].map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      width={56}
                      height={56}
                      sx={{ borderRadius: 1, flexShrink: 0 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                    <Skeleton
                      variant="rounded"
                      width={85}
                      height={32}
                      sx={{ flexShrink: 0 }}
                    />
                  </Box>
                ))}
              </Box>
            )}

            {/* === Fetch Error State === */}
            {showFetchError && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 4,
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <Typography color="error" textAlign="center">
                  Error loading collections.
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mt: 1 }}
                >
                  {fetchError}
                </Typography>
                {/* Optional: Add a retry button here */}
              </Box>
            )}
            {/* === Content (Collections or Empty State) === */}
            {showContent &&
              (filteredCollections.length > 0 ? (
                filteredCollections.map((collection) => {
                  const isAdded = collection.postIds.includes(postId);
                  const isTogglingThis = togglingCollectionId === collection.id;

                  return (
                    <Box
                      key={collection.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        px: { xs: 2, sm: 3 },
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        opacity: isTogglingThis ? 0.7 : 1,
                        pointerEvents: isTogglingThis ? 'none' : 'auto',
                        '&:last-child': { borderBottom: 0 },
                      }}
                    >
                      {/* Thumbnail Placeholder */}
                      {collection.thumbnailUrl ? (
                        <Box
                          component="img"
                          src={`${collection.thumbnailUrl}`}
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 1,
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'grey.200',
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'grey.200',
                          }}
                        />
                      )}
                      {/* Thumbnail Image */}
                      {/* Info */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="medium"
                          noWrap
                        >
                          {collection.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {collection.postIds.length} post
                          {collection.postIds.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                      {/* Action Button */}
                      <Button
                        size="small"
                        variant={isAdded ? 'outlined' : 'contained'}
                        startIcon={
                          isTogglingThis ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : isAdded ? (
                            <CheckIcon size={16} />
                          ) : null
                        }
                        disabled={isTogglingThis}
                        disableRipple={isAdded && !isTogglingThis}
                        onClick={() =>
                          handleTogglePostInCollection(collection.id)
                        }
                        aria-label={
                          isAdded
                            ? `Remove from ${collection.name}`
                            : `Add to ${collection.name}`
                        }
                        sx={{
                          flexShrink: 0,
                          textTransform: 'none',
                          fontWeight: 'normal',
                          minWidth: '85px',
                        }}
                      >
                        {isTogglingThis
                          ? isAdded
                            ? 'Adding'
                            : 'Removing'
                          : isAdded
                            ? 'Added'
                            : 'Add'}
                      </Button>
                    </Box>
                  );
                })
              ) : (
                <Typography
                  sx={{ textAlign: 'center', color: 'text.secondary', p: 4 }}
                >
                  {searchQuery
                    ? 'No collections found matching your search'
                    : 'No collections created yet.'}
                </Typography>
              ))}
          </DialogContentText>
        </DialogContent>

        {/* Footer Actions */}
        <DialogActions
          sx={{
            p: { xs: 2, sm: 3 },
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            justifyContent: 'space-between',
          }}
        >
          {/* Button now calls the new handler */}
          <Tooltip
            title={createDisabledReason}
            placement="top"
            arrow
            disableHoverListener={!createDisabled}
          >
            {/* Wrap the button in a span for Tooltip when disabled */}
            <span>
              <Button
                variant="text"
                startIcon={<PlusCircleIcon size={20} />}
                onClick={onNavigateToCreate}
                disabled={
                  createDisabled ||
                  !!togglingCollectionId ||
                  isLoading ||
                  !!fetchError
                }
                sx={{ textTransform: 'none', fontWeight: 'normal', mr: 'auto' }}
              >
                Create new collection
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="contained"
            onClick={handleClose}
            disabled={!!togglingCollectionId || isLoading}
          >
            {' '}
            {/* Use the main close handler */}
            Done
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toggleError}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: '100%' }}
        >
          {toggleError}
        </Alert>
      </Snackbar>
    </>
  );
};
