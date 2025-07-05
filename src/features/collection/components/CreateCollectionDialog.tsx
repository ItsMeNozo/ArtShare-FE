import { Collection } from '@/types';
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
import { useEffect, useState } from 'react';
import { createCollection } from '../api/collection.api';

export interface CreateCollectionFormData {
  name: string;
  isPrivate: boolean;
}

export interface CreateCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newCollection: Collection) => void;
  existingCollectionNames: string[];
}

export const CreateCollectionDialog = ({
  open,
  onClose,
  onSuccess,
  existingCollectionNames,
}: CreateCollectionDialogProps) => {
  const [collectionName, setCollectionName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCollectionName('');
      setIsPrivate(false);
      setIsLoading(false);
      setError(null);
    }
  }, [open]);

  const handleInternalClose = () => {
    if (isLoading) return;
    onClose();
  };

  const handleCreateClick = async () => {
    const trimmedName = collectionName.trim();
    if (!trimmedName) {
      setError('Collection name cannot be empty.');
      return;
    }

    const normalizedInputName = trimmedName.toLowerCase();
    const isDuplicate = existingCollectionNames.some(
      (existingName) => existingName.toLowerCase() === normalizedInputName,
    );

    if (isDuplicate) {
      setError(`A collection named "${trimmedName}" already exists.`);
      return;
    }

    setError(null);
    setIsLoading(true);

    const formData: CreateCollectionFormData = {
      name: trimmedName,
      isPrivate: isPrivate,
    };

    try {
      const newCollection = await createCollection(formData);
      console.log('Collection created successfully:', newCollection);

      onSuccess(newCollection);

      handleInternalClose();
    } catch (err) {
      console.error('Failed to create collection:', err);

      setError(
        (err as Error).message ||
          'An unexpected error occurred. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCollectionName(e.target.value);
    if (error) {
      setError(null);
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
          disabled={isLoading}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Display Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} className="bg-red-400">
            {error}
          </Alert>
        )}

        <Paper
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isLoading && collectionName.trim()) {
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
            boxShadow: 'none',
            bgcolor: 'background.paper',
            height: 40,
          }}
          className={`${error ? 'border-red-400' : ''} `}
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
            disabled={isLoading}
          />
        </Paper>
        <FormControlLabel
          control={
            <Checkbox
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              color="primary"
              size="small"
              disabled={isLoading}
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
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateClick}
          disabled={!collectionName.trim() || isLoading}
          startIcon={
            isLoading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isLoading ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
