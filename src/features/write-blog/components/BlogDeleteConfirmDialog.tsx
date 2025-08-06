import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import React from 'react';

interface BlogDeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  submitting?: boolean;
  blogTitle?: string;
}

export const BlogDeleteConfirmDialog: React.FC<
  BlogDeleteConfirmDialogProps
> = ({ open, onClose, onConfirm, submitting = false, blogTitle }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        Are you sure you want to delete{' '}
        {blogTitle ? `"${blogTitle}"` : 'this blog'}? This action cannot be
        undone.
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={submitting}
          autoFocus
        >
          {submitting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
