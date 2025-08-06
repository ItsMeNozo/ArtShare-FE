import { updateExistingBlog } from '@/features/write-blog/api/blog.api';
import { EditorHandle } from '@/features/write-blog/components/Editor';
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
  isPublished?: boolean;
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
  isPublished = false,
}: UseAutoSaveProps) => {
  const { debounce: autoSaveDebounce, cancel: cancelAutoSave } = useDebounce();
  const { debounce: titleSaveDebounce, cancel: cancelTitleSave } =
    useDebounce();
  const { debounce: createDebounce, cancel: cancelCreate } = useDebounce();

  const isSavingRef = useRef(false);
  const changesWhileSavingRef = useRef(false);

  const contentAbortControllerRef = useRef<AbortController | null>(null);
  const titleAbortControllerRef = useRef<AbortController | null>(null);

  const wasDialogOpenRef = useRef(false);

  const latestContentRef = useRef<string>('');
  const latestTitleRef = useRef<string>('');
  const pendingContentSaveRef = useRef(false);
  const pendingTitleSaveRef = useRef(false);

  const captureCurrentContent = useCallback(() => {
    const currentContent = editorRef.current?.getContent();
    if (currentContent !== undefined) {
      latestContentRef.current = currentContent;
      pendingContentSaveRef.current = true;
    }
  }, [editorRef]);

  const captureCurrentTitle = useCallback((title: string) => {
    latestTitleRef.current = title;
    pendingTitleSaveRef.current = true;
  }, []);

  const abortContentRequest = useCallback(() => {
    if (contentAbortControllerRef.current) {
      contentAbortControllerRef.current.abort();
      contentAbortControllerRef.current = null;
    }
  }, []);

  const abortTitleRequest = useCallback(() => {
    if (titleAbortControllerRef.current) {
      titleAbortControllerRef.current.abort();
      titleAbortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isDialogOpen && !wasDialogOpenRef.current) {
      cancelAutoSave();
      cancelTitleSave();
      cancelCreate();
      abortContentRequest();
      abortTitleRequest();
      wasDialogOpenRef.current = true;
    } else if (!isDialogOpen && wasDialogOpenRef.current) {
      wasDialogOpenRef.current = false;
    }
  }, [
    isDialogOpen,
    cancelAutoSave,
    cancelTitleSave,
    cancelCreate,
    abortContentRequest,
    abortTitleRequest,
  ]);

  const performAutoSave = useCallback(async () => {
    if (!blogId || blogId === 'new' || !hasUnsavedChanges || isDialogOpen) {
      return;
    }

    const content = latestContentRef.current || editorRef.current?.getContent();
    if (!content) {
      return;
    }

    abortContentRequest();

    const currentAbortController = new AbortController();
    contentAbortControllerRef.current = currentAbortController;

    isSavingRef.current = true;
    changesWhileSavingRef.current = false;
    updateSaveStatus('saving');

    try {
      const images = editorRef.current?.getImages() || [];

      await updateExistingBlog(
        parseInt(blogId, 10),
        {
          content,
          title: blogTitle?.trim() || 'Untitled Document',
          isPublished: isPublished,
          pictures: images.map((img) => img.src),
        },
        { signal: currentAbortController.signal },
      );

      if (!currentAbortController.signal.aborted) {
        if (changesWhileSavingRef.current) {
          updateSaveStatus('unsaved');
          setHasUnsavedChanges(true);
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
        }
      }
    } catch (error) {
      const saveError = error as SaveError;
      if (
        saveError.name !== 'AbortError' &&
        !currentAbortController.signal.aborted
      ) {
        console.error('❌ Auto-save failed:', saveError);
        updateSaveStatus('error');
      }
    } finally {
      isSavingRef.current = false;
      if (contentAbortControllerRef.current === currentAbortController) {
        contentAbortControllerRef.current = null;
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
    abortContentRequest,
    autoSaveDebounce,
    isPublished,
  ]);

  useEffect(() => {
    if (!hasUnsavedChanges || isCreating || isDialogOpen) {
      return;
    }
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
    captureCurrentContent();
  }, [captureCurrentContent]);

  const createAbortableTitleSave = useCallback(
    (numericBlogId: number, newTitle: string) => {
      captureCurrentTitle(newTitle);

      return async () => {
        if (isDialogOpen) return;

        const titleToSave = latestTitleRef.current || newTitle;

        abortTitleRequest();
        const currentAbortController = new AbortController();
        titleAbortControllerRef.current = currentAbortController;

        updateSaveStatus('saving');

        try {
          const images = editorRef.current?.getImages() || [];

          await updateExistingBlog(
            numericBlogId,
            {
              title: titleToSave.trim() || 'Untitled Document',
              isPublished: isPublished,
              pictures: images.map((img) => img.src),
            },
            { signal: currentAbortController.signal },
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
            !currentAbortController.signal.aborted
          ) {
            console.error('Title save failed:', saveError);
            updateSaveStatus('error');
            setHasUnsavedChanges(true);
          }
        } finally {
          if (titleAbortControllerRef.current === currentAbortController) {
            titleAbortControllerRef.current = null;
          }
        }
      };
    },
    [
      isDialogOpen,
      updateSaveStatus,
      setHasUnsavedChanges,
      captureCurrentTitle,
      abortTitleRequest,
      isPublished,
      editorRef,
    ],
  );

  // This beacon part can remain the same
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingContentSaveRef.current || pendingTitleSaveRef.current) {
        const finalContent =
          latestContentRef.current || editorRef.current?.getContent();
        const finalTitle = latestTitleRef.current || blogTitle;

        if (finalContent && blogId && blogId !== 'new') {
          // This API endpoint needs to exist on your server
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
    performAutoSave,
    delays: DELAYS,
  };
};
