import { useState } from 'react';

export const useConfirmationDialog = <T>() => {
  const [isOpen, setIsOpen] = useState(false);
  // This state will hold the item to be acted upon (e.g., the ID of the post to delete)
  const [item, setItem] = useState<T | null>(null);

  const openDialog = (itemToConfirm: T) => {
    setItem(itemToConfirm);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setItem(null);
    setIsOpen(false);
  };

  return {
    isDialogOpen: isOpen,
    itemToConfirm: item,
    openDialog,
    closeDialog,
  };
};
