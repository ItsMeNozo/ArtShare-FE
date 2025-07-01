import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  submitting?: boolean;
  itemName?: string;
  itemType?: string;
}

const ReportDialog: React.FC<ReportDialogProps> = ({
  open,
  onClose,
  onSubmit,
  submitting = false,
  itemName,
  itemType,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setError("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Please enter a reason.");
      return;
    }
    onSubmit(reason.trim());
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        Report{" "}
        {itemType
          ? itemType.charAt(0).toUpperCase() + itemType.slice(1)
          : "Content"}
        {itemName && `: "${itemName}"`}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          autoFocus
          multiline
          minRows={3}
          fullWidth
          label="Reason for reporting"
          placeholder="Describe why you are reporting this"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError("");
          }}
          disabled={submitting}
          error={!!error}
          helperText={error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={submitting}
        >
          {submitting ? "Reporting…" : "Report"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialog;
