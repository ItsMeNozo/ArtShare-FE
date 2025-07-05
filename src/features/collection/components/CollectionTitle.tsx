import {
  Box,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FiX as CancelIcon,
  FiCheck as SaveIcon,
  FiMoreVertical as MoreIcon,
} from 'react-icons/fi';

interface CollectionTitleProps {
  title: string;
  itemCountText: string;
  isEditable: boolean;
  isPrivate: boolean;
  isLoading?: boolean;
  error?: string | null;
  onSave: (newName: string) => Promise<void>;
  onSetPrivacy: (isPrivate: boolean) => Promise<void>;
  isEditing: boolean;
  onEditRequest: () => void;
  onEditCancel: () => void;
  existingCollectionNames: string[];
}

export const CollectionTitle: React.FC<CollectionTitleProps> = ({
  title,
  itemCountText,
  isEditable,
  isPrivate,
  isLoading = false,
  error,
  onSave,
  onSetPrivacy,
  isEditing,
  onEditRequest,
  onEditCancel,
  existingCollectionNames,
}) => {
  const [editedTitle, setEditedTitle] = useState<string>(title);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRenameClick = () => {
    handleMenuClose();
    requestEditMode();
  };

  const handlePrivacyClick = async () => {
    handleMenuClose();
    // Assuming onSetPrivacy will handle the API call and state update
    await onSetPrivacy(!isPrivate);
  };

  useEffect(() => {
    if (!isEditing) {
      setEditedTitle(title);
      setSaveError(null);
    }

    setEditedTitle(title);
  }, [title, isEditing]);

  const requestEditMode = useCallback(() => {
    if (!isLoading) {
      setEditedTitle(title);
      setSaveError(null);
      onEditRequest();
      setIsHovered(false);
    }
  }, [title, isLoading, onEditRequest]);

  const cancelEditMode = useCallback(() => {
    onEditCancel();
  }, [onEditCancel]);

  const handleSave = useCallback(async () => {
    const newNameTrimmed = editedTitle.trim();

    if (newNameTrimmed === '' || newNameTrimmed === title) {
      cancelEditMode();
      return;
    }

    const lowerCaseNewName = newNameTrimmed.toLowerCase();
    const lowerCaseOriginalName = title.toLowerCase();

    const isDuplicate = existingCollectionNames.some(
      (existingName) =>
        existingName.toLowerCase() === lowerCaseNewName &&
        existingName.toLowerCase() !== lowerCaseOriginalName,
    );

    if (isDuplicate) {
      setSaveError('A collection with this name already exists.');
      setIsSaving(false);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(newNameTrimmed);
    } catch (err) {
      console.error('Error saving title:', err);
      setSaveError(
        err instanceof Error ? err.message : 'Failed to save title.',
      );
    } finally {
      setIsSaving(false);
    }
  }, [editedTitle, title, onSave, cancelEditMode, existingCollectionNames]);

  const displayError = error || saveError;

  return (
    <Box
      minHeight={48}
      onMouseEnter={() =>
        isEditable && !isEditing && !isLoading && setIsHovered(true)
      }
      onMouseLeave={() => setIsHovered(false)}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        {/* Check the isEditing prop passed from parent */}
        {isEditing && isEditable ? (
          <>
            {/* Text Field */}
            <TextField
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              variant="outlined"
              size="small"
              autoFocus
              disabled={isSaving || isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSaving) handleSave();
                if (e.key === 'Escape' && !isSaving) cancelEditMode();
              }}
              error={!!saveError}
              sx={{ flexGrow: 1, maxWidth: 400 }}
            />
            {/* Save Button */}
            <Tooltip title="Save Changes">
              <span>
                <IconButton
                  size="small"
                  onClick={handleSave}
                  disabled={
                    isSaving ||
                    isLoading ||
                    editedTitle.trim() === '' ||
                    editedTitle.trim() === title
                  }
                >
                  {isSaving ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SaveIcon fontSize={20} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            {/* Cancel Button */}
            <Tooltip title="Cancel Edit">
              <span>
                <IconButton
                  size="small"
                  onClick={cancelEditMode}
                  disabled={isSaving || isLoading}
                >
                  <CancelIcon fontSize={20} />
                </IconButton>
              </span>
            </Tooltip>
          </>
        ) : (
          <>
            {/* Display Mode */}
            <Typography variant="h6" component="h2" fontWeight="normal" noWrap>
              {isLoading ? 'Loading Title...' : title}
            </Typography>
            {!isLoading && (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ pl: 0.5 }}
              >
                ({itemCountText})
              </Typography>
            )}
            {isEditable && !isLoading && (
              <>
                <Tooltip title="Options">
                  <IconButton
                    size="small"
                    onClick={handleMenuOpen}
                    sx={{
                      opacity: isHovered || isMenuOpen ? 1 : 0,
                      transition: 'opacity 0.2s ease-in-out',
                    }}
                  >
                    <MoreIcon fontSize={20} />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={isMenuOpen}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleRenameClick}>Rename</MenuItem>
                  <MenuItem onClick={handlePrivacyClick}>
                    {isPrivate ? 'Make Public' : 'Make Private'}
                  </MenuItem>
                </Menu>
              </>
            )}
          </>
        )}
      </Stack>

      {displayError && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {displayError}
        </Typography>
      )}
    </Box>
  );
};
