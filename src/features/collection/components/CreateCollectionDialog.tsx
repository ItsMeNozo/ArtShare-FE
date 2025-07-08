import { Alert, CircularProgress, Paper } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface CreateCollectionFormData {
  name: string;
  isPrivate: boolean;
}

export interface CreateCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: CreateCollectionFormData) => void;
  existingCollectionNames: string[];
  isSubmitting: boolean;
  error?: string | null;
}

export const CreateCollectionDialog = ({
  open,
  onClose,
  onSuccess,
  existingCollectionNames,
  isSubmitting,
  error: submissionError,
}: CreateCollectionDialogProps) => {
  const [collectionName, setCollectionName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCollectionName('');
      setIsPrivate(false);
      setValidationError(null);
    }
  }, [open]);

  const displayError = validationError || submissionError;

  const handleInternalClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleCreateClick = () => {
    const trimmedName = collectionName.trim();
    if (!trimmedName) {
      setValidationError('Collection name cannot be empty.');
      return;
    }

    const normalizedInputName = trimmedName.toLowerCase();
    const isDuplicate = existingCollectionNames.some(
      (existingName) => existingName.toLowerCase() === normalizedInputName,
    );

    if (isDuplicate) {
      setValidationError(`A collection named "${trimmedName}" already exists.`);
      return;
    }

    setValidationError(null);
    onSuccess({
      name: trimmedName,
      isPrivate: isPrivate,
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCollectionName(e.target.value);

    if (validationError) {
      setValidationError(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleInternalClose}
      aria-labelledby="create-collection-dialog-title"
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle
        id="create-collection-dialog-title"
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Create New Collection</span>
        <IconButton
          aria-label="close"
          onClick={handleInternalClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
          disabled={isSubmitting}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {displayError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {displayError}
          </Alert>
        )}

        <Paper
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isSubmitting) {
              handleCreateClick();
            }
          }}
          sx={{
            p: '2px 4px',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            borderRadius: '16px',
            border: '1px solid',
            borderColor: displayError ? 'error.main' : 'divider',
            boxShadow: 'none',
            bgcolor: 'background.paper',
            height: 40,
          }}
        >
          <Input
            placeholder="Collection name"
            fullWidth
            sx={{ ml: 2 }}
            disableUnderline
            value={collectionName}
            onChange={handleNameChange}
            autoFocus
            required
            disabled={isSubmitting}
          />
        </Paper>
        <FormControlLabel
          control={
            <Checkbox
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              color="primary"
              size="small"
              disabled={isSubmitting}
            />
          }
          label="Make this collection private"
          sx={{ display: 'block' }}
        />
      </DialogContent>
      <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 2 }}>
        <Button
          variant="text"
          onClick={handleInternalClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateClick}
          disabled={!collectionName.trim() || isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
