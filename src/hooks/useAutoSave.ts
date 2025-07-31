import { updateExistingBlog } from '@/features/user-writing/api/blog.api';
import { EditorHandle } from '@/features/user-writing/components/Editor';
import { useCallback, useEffect, useRef } from 'react';
import type { SaveStatus } from './useBlogState';
import { useDebounce } from './useDebounce';

const DELAYS = {
  create: 500,
  titleSave: 800,
  autoSave: 2000,
} as const;

interface UseAutoSaveProps {
  blogId: string | undefined;
  blogTitle: string;
  hasUnsavedChanges: boolean;
  isCreating: boolean;
  isNewDocument: boolean;
  updateSaveStatus: (status: SaveStatus, saved?: Date) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  editorRef: React.RefObject<EditorHandle>;
  isDialogOpen?: boolean;
}

export const useAutoSave = ({
  blogId,
  blogTitle,
  hasUnsavedChanges,
  isCreating,
  updateSaveStatus,
  setHasUnsavedChanges,
  editorRef,
  isDialogOpen = false,
}: UseAutoSaveProps) => {
  const { debounce: autoSaveDebounce, cancel: cancelAutoSave } = useDebounce();
  const { debounce: titleSaveDebounce, cancel: cancelTitleSave } =
    useDebounce();
  const { debounce: createDebounce, cancel: cancelCreate } = useDebounce();

  const isSavingRef = useRef(false);
  const changesWhileSavingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const wasDialogOpenRef = useRef(false);

  // Cancel all operations when dialog opens
  useEffect(() => {
    if (isDialogOpen && !wasDialogOpenRef.current) {
      // Dialog just opened - cancel everything
      cancelAutoSave();
      cancelTitleSave();
      cancelCreate();

      // Abort any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Don't reset saving state - just freeze it
      wasDialogOpenRef.current = true;
    } else if (!isDialogOpen && wasDialogOpenRef.current) {
      // Dialog just closed - reset flag
      wasDialogOpenRef.current = false;
    }
  }, [isDialogOpen, cancelAutoSave, cancelTitleSave, cancelCreate]);

  const performAutoSave = useCallback(async () => {
    if (!blogId || blogId === 'new' || !hasUnsavedChanges || isDialogOpen)
      return;

    const content = editorRef.current?.getContent();
    if (!content) return;

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    isSavingRef.current = true;
    changesWhileSavingRef.current = false;
    updateSaveStatus('saving');

    try {
      await updateExistingBlog(
        parseInt(blogId, 10),
        {
          content,
          title: blogTitle?.trim() || 'Untitled Document',
          isPublished: false,
        },
        { signal: abortControllerRef.current.signal },
      );

      // Only update status if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        if (changesWhileSavingRef.current) {
          updateSaveStatus('unsaved');
        } else {
          setHasUnsavedChanges(false);
          updateSaveStatus('saved', new Date());
        }
      }
    } catch (error: any) {
      // Don't show error for aborted requests (fetch uses 'AbortError', axios uses 'CanceledError')
      if (
        error.name !== 'AbortError' &&
        error.name !== 'CanceledError' &&
        !abortControllerRef.current?.signal.aborted
      ) {
        console.error('Auto-save failed:', error);
        updateSaveStatus('error');
      }
    } finally {
      isSavingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [
    blogId,
    blogTitle,
    hasUnsavedChanges,
    isDialogOpen,
    updateSaveStatus,
    setHasUnsavedChanges,
    editorRef,
  ]);

  useEffect(() => {
    if (!hasUnsavedChanges || isCreating || isDialogOpen) return;

    updateSaveStatus('unsaved');
    autoSaveDebounce(performAutoSave, DELAYS.autoSave);

    return cancelAutoSave;
  }, [
    hasUnsavedChanges,
    isCreating,
    isDialogOpen,
    performAutoSave,
    autoSaveDebounce,
    cancelAutoSave,
    updateSaveStatus,
  ]);

  const markChangesWhileSaving = useCallback(() => {
    if (isSavingRef.current) {
      changesWhileSavingRef.current = true;
    }
  }, []);

  // Helper to create abortable title save
  const createAbortableTitleSave = useCallback(
    (numericBlogId: number, newTitle: string) => {
      return async () => {
        if (isDialogOpen) return; // Don't start if dialog is open

        abortControllerRef.current = new AbortController();
        updateSaveStatus('saving');

        try {
          await updateExistingBlog(
            numericBlogId,
            {
              title: newTitle.trim() || 'Untitled Document',
              isPublished: false,
            },
            { signal: abortControllerRef.current.signal },
          );

          if (!abortControllerRef.current.signal.aborted) {
            updateSaveStatus('saved', new Date());
            setHasUnsavedChanges(false);
          }
        } catch (error: any) {
          if (
            error.name !== 'AbortError' &&
            error.name !== 'CanceledError' &&
            !abortControllerRef.current?.signal.aborted
          ) {
            console.error('Title save failed:', error);
            updateSaveStatus('error');
            setHasUnsavedChanges(true);
          }
        } finally {
          abortControllerRef.current = null;
        }
      };
    },
    [isDialogOpen, updateSaveStatus, setHasUnsavedChanges],
  );

  return {
    autoSaveDebounce,
    cancelAutoSave,
    titleSaveDebounce,
    cancelTitleSave,
    createDebounce,
    cancelCreate,
    markChangesWhileSaving,
    createAbortableTitleSave,
    delays: DELAYS,
  };
};
