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

interface SaveError extends Error {
  name: string;
  code?: string;
  status?: number;
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

  // Enhanced tracking for input capture and abort control
  const isSavingRef = useRef(false);
  const changesWhileSavingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const wasDialogOpenRef = useRef(false);

  // Critical: Track latest content to prevent loss during rapid typing
  const latestContentRef = useRef<string>('');
  const latestTitleRef = useRef<string>('');
  const pendingContentSaveRef = useRef(false);
  const pendingTitleSaveRef = useRef(false);

  // Enhanced content capture - call immediately when content changes
  const captureCurrentContent = useCallback(() => {
    const currentContent = editorRef.current?.getContent();
    if (currentContent !== undefined) {
      latestContentRef.current = currentContent;
      pendingContentSaveRef.current = true;
    }
  }, [editorRef]);

  // Enhanced title capture
  const captureCurrentTitle = useCallback((title: string) => {
    latestTitleRef.current = title;
    pendingTitleSaveRef.current = true;
  }, []);

  // ✅ FIXED: Improved abort controller management
  const abortCurrentRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      console.log('🚫 Aborted ongoing request');
    }
  }, []);

  // ✅ FIXED: Better dialog state management
  useEffect(() => {
    if (isDialogOpen && !wasDialogOpenRef.current) {
      // Dialog just opened - immediately abort and cancel everything
      console.log('🛑 Dialog opened - canceling all saves');

      // Cancel debounced operations first
      cancelAutoSave();
      cancelTitleSave();
      cancelCreate();

      // Then abort any in-flight request
      abortCurrentRequest();

      wasDialogOpenRef.current = true;
    } else if (!isDialogOpen && wasDialogOpenRef.current) {
      // Dialog just closed
      wasDialogOpenRef.current = false;
      console.log('✅ Dialog closed - resuming saves if needed');
    }
  }, [
    isDialogOpen,
    cancelAutoSave,
    cancelTitleSave,
    cancelCreate,
    abortCurrentRequest,
  ]);

  const performAutoSave = useCallback(async () => {
    if (!blogId || blogId === 'new' || !hasUnsavedChanges || isDialogOpen) {
      return;
    }

    // Use captured content to ensure we have the latest version
    const content = latestContentRef.current || editorRef.current?.getContent();
    if (!content) return;

    // ✅ FIXED: Abort any existing request before starting new one
    abortCurrentRequest();

    // Create new abort controller for this request
    const currentAbortController = new AbortController();
    abortControllerRef.current = currentAbortController;

    isSavingRef.current = true;
    changesWhileSavingRef.current = false;
    updateSaveStatus('saving');

    console.log('💾 Starting auto-save...');

    try {
      await updateExistingBlog(
        parseInt(blogId, 10),
        {
          content,
          title: blogTitle?.trim() || 'Untitled Document',
          isPublished: false,
        },
        { signal: currentAbortController.signal }, // ✅ CRITICAL: Pass abort signal
      );

      // Only update status if request wasn't aborted
      if (!currentAbortController.signal.aborted) {
        if (changesWhileSavingRef.current) {
          // New changes came in while saving
          updateSaveStatus('unsaved');
          setHasUnsavedChanges(true);
          console.log('📝 Changes detected during save - staying unsaved');

          // Trigger another save for the new changes after a short delay
          setTimeout(() => {
            if (!isDialogOpen && changesWhileSavingRef.current) {
              changesWhileSavingRef.current = false;
              autoSaveDebounce(performAutoSave, DELAYS.autoSave);
            }
          }, 100);
        } else {
          setHasUnsavedChanges(false);
          updateSaveStatus('saved', new Date());
          pendingContentSaveRef.current = false;
          console.log('✅ Auto-save completed successfully');
        }
      } else {
        console.log('🚫 Auto-save was aborted');
      }
    } catch (error) {
      const saveError = error as SaveError;
      // Don't show error for aborted requests
      if (
        saveError.name !== 'AbortError' &&
        saveError.name !== 'CanceledError' &&
        !currentAbortController.signal.aborted
      ) {
        console.error('❌ Auto-save failed:', saveError);
        updateSaveStatus('error');
      } else {
        console.log('🚫 Auto-save request was aborted');
      }
    } finally {
      isSavingRef.current = false;
      // Only clear if this is still the current abort controller
      if (abortControllerRef.current === currentAbortController) {
        abortControllerRef.current = null;
      }
    }
  }, [
    blogId,
    blogTitle,
    hasUnsavedChanges,
    isDialogOpen,
    updateSaveStatus,
    setHasUnsavedChanges,
    editorRef,
    abortCurrentRequest,
    autoSaveDebounce,
  ]);

  // ✅ FIXED: Proper auto-save trigger with abort controller support
  useEffect(() => {
    if (!hasUnsavedChanges || isCreating || isDialogOpen) return;

    // Always trigger save status and debounced save
    updateSaveStatus('unsaved');
    autoSaveDebounce(performAutoSave, DELAYS.autoSave);

    return cancelAutoSave;
  }, [
    hasUnsavedChanges,
    isCreating,
    isDialogOpen,
    cancelAutoSave,
    updateSaveStatus,
    autoSaveDebounce,
    performAutoSave,
  ]);

  const markChangesWhileSaving = useCallback(() => {
    if (isSavingRef.current) {
      changesWhileSavingRef.current = true;
    }
    // Always capture the latest content when changes occur
    captureCurrentContent();
  }, [captureCurrentContent]);

  // ✅ FIXED: Enhanced title save with proper abort support
  const createAbortableTitleSave = useCallback(
    (numericBlogId: number, newTitle: string) => {
      // Immediately capture the title
      captureCurrentTitle(newTitle);

      return async () => {
        if (isDialogOpen) return;

        // Use captured title
        const titleToSave = latestTitleRef.current || newTitle;

        // Abort any existing request before starting new one
        abortCurrentRequest();

        // Create new abort controller
        const currentAbortController = new AbortController();
        abortControllerRef.current = currentAbortController;
        updateSaveStatus('saving');

        try {
          await updateExistingBlog(
            numericBlogId,
            {
              title: titleToSave.trim() || 'Untitled Document',
              isPublished: false,
            },
            { signal: currentAbortController.signal }, // ✅ CRITICAL: Pass abort signal
          );

          if (!currentAbortController.signal.aborted) {
            updateSaveStatus('saved', new Date());
            setHasUnsavedChanges(false);
            pendingTitleSaveRef.current = false;
          }
        } catch (error) {
          const saveError = error as SaveError;
          if (
            saveError.name !== 'AbortError' &&
            saveError.name !== 'CanceledError' &&
            !currentAbortController.signal.aborted
          ) {
            console.error('Title save failed:', saveError);
            updateSaveStatus('error');
            setHasUnsavedChanges(true);
          }
        } finally {
          // Only clear if this is still the current abort controller
          if (abortControllerRef.current === currentAbortController) {
            abortControllerRef.current = null;
          }
        }
      };
    },
    [
      isDialogOpen,
      updateSaveStatus,
      setHasUnsavedChanges,
      captureCurrentTitle,
      abortCurrentRequest,
    ],
  );

  // Enhanced beforeunload protection for pending changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      // If we have pending unsaved content, try to save it
      if (pendingContentSaveRef.current || pendingTitleSaveRef.current) {
        const finalContent =
          latestContentRef.current || editorRef.current?.getContent();
        const finalTitle = latestTitleRef.current || blogTitle;

        if (finalContent && blogId && blogId !== 'new') {
          // Use sendBeacon for reliable last-chance saving
          navigator.sendBeacon(
            '/api/blogs/autosave',
            JSON.stringify({
              blogId: parseInt(blogId, 10),
              content: finalContent,
              title: finalTitle?.trim() || 'Untitled Document',
            }),
          );
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [blogId, blogTitle, editorRef]);

  // Expose content capture for immediate use in onChange handlers
  const triggerContentCapture = useCallback(() => {
    captureCurrentContent();
  }, [captureCurrentContent]);

  return {
    autoSaveDebounce,
    cancelAutoSave,
    titleSaveDebounce,
    cancelTitleSave,
    createDebounce,
    cancelCreate,
    markChangesWhileSaving,
    createAbortableTitleSave,
    triggerContentCapture,
    performAutoSave, // ✅ FIXED: Exposed for use in onStay callback
    delays: DELAYS,
  };
};
