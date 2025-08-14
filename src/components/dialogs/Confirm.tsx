import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Dispatch, SetStateAction } from 'react';

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmMessage: string;
  icon?: React.ReactNode;
  open: boolean;
  isLoading?: boolean;
  onCancel: Dispatch<SetStateAction<boolean>>;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  title,
  description,
  confirmMessage,
  icon,
  open,
  isLoading,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="border-mountain-200 flex w-108 flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {icon && (
          <div className="bg-mountain-50 flex items-center justify-center py-6">
            {icon}
          </div>
        )}
        <DialogFooter>
          <Button
            className="bg-mountain-200 hover:bg-mountain-200/80 text-mountain-950"
            onClick={() => onCancel(!open)}
          >
            Cancel
          </Button>
          <Button
            className="text-mountain-50 bg-red-700 hover:bg-red-700/80"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {confirmMessage}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
