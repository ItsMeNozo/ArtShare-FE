import { useCallback, useState } from 'react';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export const useBlogState = (initialTitle = '') => {
  const [blogTitle, setBlogTitle] = useState(initialTitle);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  const [createdDocId, setCreatedDocId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [hasContentForCreation, setHasContentForCreation] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const updateSaveStatus = useCallback((status: SaveStatus, saved?: Date) => {
    setSaveStatus(status);
    if (saved) setLastSaved(saved);
  }, []);

  return {
    blogTitle,
    setBlogTitle,
    isApiLoading,
    setIsApiLoading,
    isContentReady,
    setIsContentReady,
    isPublished,
    setIsPublished,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    saveStatus,
    updateSaveStatus,
    lastSaved,
    createdDocId,
    setCreatedDocId,
    isCreating,
    setIsCreating,
    hasContentForCreation,
    setHasContentForCreation,
    tooltipOpen,
    setTooltipOpen,
  };
};
