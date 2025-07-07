import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const UnsavedChangesModal = ({
  isOpen,
  onClose,
  onConfirm,
}: UnsavedChangesModalProps) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Unsaved Changes</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You have unsaved changes. Are you sure you want to leave this page?
          Your changes will be lost.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Stay
        </Button>
        <Button onClick={onConfirm} color="warning" autoFocus>
          Leave
        </Button>
      </DialogActions>
    </Dialog>
  );
};
