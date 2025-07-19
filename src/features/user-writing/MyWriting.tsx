import { TUTORIAL_TEMPLATE_HTML } from '@/constants/template';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Blog } from '@/types/blog';
import { AxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchBlogDetails } from '../blog-details/api/blog';
import {
  CreateBlogPayload,
  createNewBlog,
  UpdateBlogPayload,
  updateExistingBlog,
} from './api/blog.api';
import { AutoSaveStatus } from './components/AutoSaveStatus';
import Editor, { EditorHandle } from './components/Editor';
import TextEditorHeader from './components/TextEditorHeader';
import Toolbar from './components/Toolbar';

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface AutoSaveStatusProps {
  status: SaveStatus;
  lastSaved?: Date;
  isNewDocument: boolean;
  createdDocId: number | null;
  isCreating: boolean;
  hasContent: boolean;
}

interface DialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isCreating?: boolean;
}

const DEBOUNCE_DELAYS = {
  create: 500,
  titleSave: 800,
  autoSave: 2000,
} as const;

const DIALOG_CONTENT = {
  creating: {
    title: 'Discard document?',
    message:
      'Your document will be created once you start typing. Are you sure you want to leave?',
    confirmText: 'Leave',
  },
  unsaved: {
    title: 'Discard unsaved changes?',
    message:
      'You have unsaved changes that will be lost if you leave this page.',
    confirmText: 'Discard',
  },
} as const;

const StatusIndicator = ({
  className,
  text,
}: {
  className: string;
  text: string;
}) => (
  <div className={`flex items-center space-x-2 text-sm ${className}`}>
    <div className="h-2 w-2 rounded-full bg-current opacity-60"></div>
    <span>{text}</span>
  </div>
);

const LoadingSpinner = ({ size = 'sm' }: { size?: 'sm' | 'lg' }) => (
  <div className={`loading-spinner${size === 'lg' ? '-large' : ''}`}></div>
);

const EnhancedAutoSaveStatus = ({
  status,
  lastSaved,
  isNewDocument,
  createdDocId,
  isCreating,
  hasContent,
}: AutoSaveStatusProps) => {
  if (isNewDocument && !createdDocId) {
    if (isCreating) {
      return (
        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
          <LoadingSpinner />
          <span>Creating document...</span>
        </div>
      );
    }

    if (!hasContent) {
      return (
        <StatusIndicator
          className="text-gray-500 dark:text-gray-400"
          text="Start typing to create document"
        />
      );
    }
  }

  return <AutoSaveStatus status={status} lastSaved={lastSaved} />;
};

const UnsavedChangesDialog = ({
  open,
  onConfirm,
  onCancel,
  isCreating = false,
}: DialogProps) => {
  if (!open) return null;

  const content = isCreating ? DIALOG_CONTENT.creating : DIALOG_CONTENT.unsaved;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="dark:bg-mountain-800 mx-4 w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          {content.title}
        </h3>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {content.message}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="dark:bg-mountain-600 dark:hover:bg-mountain-500 rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            {content.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="dark:bg-mountain-950 flex h-screen w-full items-center justify-center bg-white">
    <div className="flex flex-col items-center space-y-4">
      <LoadingSpinner size="lg" />
      <span className="text-gray-700 dark:text-gray-300">
        Loading editor data...
      </span>
    </div>
  </div>
);

const WriteBlog = () => {
  const editorRef = useRef<EditorHandle>(null);
  const createDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const titleSaveDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  const { showSnackbar } = useSnackbar();
  const { blogId } = useParams<{ blogId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const templateType = new URLSearchParams(location.search).get('template');
  const isNewDocument = blogId === 'new';
  const preloadedTitle = location.state?.title;

  // State management
  const [blogTitle, setBlogTitle] = useState(
    preloadedTitle || (isNewDocument ? '' : ''),
  );
  const [isApiLoading, setIsApiLoading] = useState(!isNewDocument);
  const [isContentReady, setIsContentReady] = useState(isNewDocument);
  const [isPublished, setIsPublished] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  const [createdDocId, setCreatedDocId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [hasContentForCreation, setHasContentForCreation] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );
  const [initialContent, setInitialContent] = useState<string | null>(null);

  const hasContentToSave = useCallback(() => {
    const content = editorRef.current?.getContent() || '';
    return content.replace(/<[^>]*>/g, '').trim().length > 0;
  }, []);

  const clearTimers = useCallback(() => {
    [createDebounceRef, titleSaveDebounceRef, autoSaveRef].forEach((ref) => {
      if (ref.current) {
        clearTimeout(ref.current);
        ref.current = null;
      }
    });
  }, []);

  const updateSaveStatus = useCallback((status: SaveStatus, saved?: Date) => {
    setSaveStatus(status);
    if (saved) setLastSaved(saved);
  }, []);

  const handleApiError = useCallback(
    (error: unknown, defaultMessage: string) => {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || defaultMessage
          : error instanceof Error
            ? error.message
            : defaultMessage;

      showSnackbar(errorMessage, 'error');
      console.error(error);
      setIsApiLoading(false);
      navigate('/blogs', { replace: true });
    },
    [showSnackbar, navigate],
  );

  const createNewDocument = useCallback(async () => {
    if (!isNewDocument || createdDocId || isCreating) return;

    setIsCreating(true);
    try {
      const payload: CreateBlogPayload = {
        title: blogTitle,
        isPublished: false,
        content: editorRef.current?.getContent() || '',
      };

      const newBlog = await createNewBlog(payload);
      setCreatedDocId(newBlog.id);
      navigate(`/docs/${newBlog.id}`, {
        replace: true,
        state: { preserveContent: true },
      });

      setHasUnsavedChanges(false);
      updateSaveStatus('saved', new Date());
    } catch (error) {
      handleApiError(error, 'Failed to create document');
    } finally {
      setIsCreating(false);
    }
  }, [
    isNewDocument,
    createdDocId,
    isCreating,
    blogTitle,
    navigate,
    handleApiError,
    updateSaveStatus,
  ]);

  const handleEditorChange = useCallback(() => {
    const hasContent = hasContentToSave();
    setHasContentForCreation(hasContent);

    if (isNewDocument && !createdDocId && !isCreating && hasContent) {
      clearTimeout(createDebounceRef.current!);
      createDebounceRef.current = setTimeout(
        createNewDocument,
        DEBOUNCE_DELAYS.create,
      );
      return;
    }

    if (!isNewDocument && blogId !== 'new') {
      setHasUnsavedChanges(true);
      updateSaveStatus('unsaved');
    }
  }, [
    isNewDocument,
    createdDocId,
    isCreating,
    blogId,
    hasContentToSave,
    createNewDocument,
    updateSaveStatus,
  ]);

  const handleTitleChange = useCallback(
    async (newTitle: string) => {
      setBlogTitle(newTitle);

      if (!isNewDocument && blogId !== 'new' && blogId) {
        const numericBlogId = parseInt(blogId, 10);
        if (isNaN(numericBlogId)) return;

        clearTimeout(titleSaveDebounceRef.current!);
        setHasUnsavedChanges(true);
        updateSaveStatus('unsaved');

        titleSaveDebounceRef.current = setTimeout(async () => {
          updateSaveStatus('saving');
          try {
            const trimmed = newTitle.trim();
            await updateExistingBlog(numericBlogId, {
              title: trimmed && trimmed !== 'Untitled Document' ? trimmed : '',
              isPublished: false,
            });
            updateSaveStatus('saved', new Date());
            setHasUnsavedChanges(false);
          } catch (error) {
            handleApiError(error, 'Failed to save title');
            updateSaveStatus('error');
            setHasUnsavedChanges(true);
          }
        }, DEBOUNCE_DELAYS.titleSave);
      }
    },
    [isNewDocument, blogId, updateSaveStatus, handleApiError],
  );

  const handleExportDocument = useCallback(async () => {
    if (!blogId) return;

    try {
      const link = `${window.location.origin}/blogs/${blogId}`;
      await navigator.clipboard.writeText(link);
      setTooltipOpen(true);
      setTimeout(() => setTooltipOpen(false), 1500);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  }, [blogId]);

  const handleSaveBlog = useCallback(
    async (currentTitle: string) => {
      if (!editorRef.current || !blogId) return;

      updateSaveStatus('saving');
      const content = editorRef.current.getContent();
      const images = editorRef.current.getImages() || [];
      const numericBlogId = parseInt(blogId, 10);

      const trimmedTitle = currentTitle?.trim() || '';
      const titleToSave =
        trimmedTitle && trimmedTitle !== 'Untitled Document'
          ? trimmedTitle
          : '';

      const payload: UpdateBlogPayload = {
        title: titleToSave,
        isPublished: true,
        pictures: images.map((img) => img.src),
        content,
      };

      try {
        const updatedBlog: Blog = await updateExistingBlog(
          numericBlogId,
          payload,
        );
        updateSaveStatus('saved', new Date());
        setHasUnsavedChanges(false);
        navigate(`/blogs/${updatedBlog.id}`);
      } catch (error) {
        updateSaveStatus('error');
        handleApiError(error, 'Failed to save blog.');
      }
    },
    [blogId, navigate, updateSaveStatus, handleApiError],
  );

  const isPublishDisabled = useMemo(() => {
    const isTitleEmpty = !blogTitle?.trim();
    const isContentEmpty = !hasContentForCreation;
    return isTitleEmpty || isContentEmpty;
  }, [blogTitle, hasContentForCreation]);

  const statusComponent = useMemo(
    () => (
      <EnhancedAutoSaveStatus
        status={saveStatus}
        lastSaved={lastSaved}
        isNewDocument={isNewDocument}
        createdDocId={createdDocId}
        isCreating={isCreating}
        hasContent={hasContentForCreation}
      />
    ),
    [
      saveStatus,
      lastSaved,
      isNewDocument,
      createdDocId,
      isCreating,
      hasContentForCreation,
    ],
  );

  // Initialize editor
  useEffect(() => {
    const initializeEditor = async () => {
      if (isNewDocument) {
        const content =
          templateType === 'tutorial' ? TUTORIAL_TEMPLATE_HTML : '';
        setInitialContent(content);
        setIsApiLoading(false);
        setIsContentReady(true);
        return;
      }

      if (!blogId) return;

      try {
        const numericBlogId = parseInt(blogId, 10);
        if (isNaN(numericBlogId)) {
          throw new Error('Invalid blog ID');
        }

        const blog = await fetchBlogDetails(numericBlogId);
        setBlogTitle(blog.title || 'Untitled Document');
        setIsPublished(blog.isPublished || false);
        setInitialContent(blog.content || '');
      } catch (error) {
        handleApiError(error, 'Failed to load blog content.');
      } finally {
        setIsApiLoading(false);
      }
    };

    initializeEditor();
  }, [blogId, isNewDocument, templateType, handleApiError]);

  // Set initial content
  useEffect(() => {
    if (initialContent !== null && editorRef.current) {
      editorRef.current.setContent(initialContent);
      setIsContentReady(true);
      setHasContentForCreation(hasContentToSave());
    }
  }, [initialContent, hasContentToSave]);

  // Auto-save logic
  useEffect(() => {
    if (!hasUnsavedChanges || !blogId || blogId === 'new' || isCreating) return;

    updateSaveStatus('unsaved');
    clearTimeout(autoSaveRef.current!);

    autoSaveRef.current = setTimeout(async () => {
      const content = editorRef.current?.getContent();
      if (!content) return;

      updateSaveStatus('saving');
      try {
        await updateExistingBlog(parseInt(blogId, 10), {
          content,
          title: blogTitle?.trim() || 'Untitled Document',
          isPublished: false,
        });
        setHasUnsavedChanges(false);
        updateSaveStatus('saved', new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
        updateSaveStatus('error');
      }
    }, DEBOUNCE_DELAYS.autoSave);

    return () => clearTimeout(autoSaveRef.current!);
  }, [hasUnsavedChanges, blogId, blogTitle, isCreating, updateSaveStatus]);

  // Focus editor when ready
  useEffect(() => {
    if (isContentReady && !isApiLoading && editorRef.current) {
      const timeoutId = setTimeout(() => editorRef.current?.focus(), 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isContentReady, isApiLoading]);

  // Handle beforeunload and cleanup
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (
        (isNewDocument && hasContentForCreation) ||
        (!isNewDocument && hasUnsavedChanges)
      ) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimers();
    };
  }, [isNewDocument, hasContentForCreation, hasUnsavedChanges, clearTimers]);

  const titleDisplay = blogTitle || 'Untitled Document';
  const isTitleEmpty = !blogTitle?.trim();

  return (
    <>
      <div className="dark:bg-mountain-950 flex h-full w-full flex-row bg-white">
        <div className="flex h-full w-[calc(100vw-16rem)] flex-1 flex-col">
          <TextEditorHeader
            handleExport={handleExportDocument}
            handleSaveBlog={handleSaveBlog}
            text={titleDisplay}
            setText={handleTitleChange}
            isPublished={isPublished}
            tooltipOpen={tooltipOpen}
            saveStatus={statusComponent}
            isTitleLoading={isApiLoading}
            isPublishDisabled={isPublishDisabled}
            isTitleEmpty={isTitleEmpty}
            hasContent={hasContentForCreation}
          />
          <div className="border-mountain-100 bg-mountain-50 dark:border-mountain-700 dark:bg-mountain-900 h-full w-full border-l">
            {(isApiLoading || !isContentReady) && <LoadingScreen />}
            <Toolbar />
            <div className="sidebar dark:print:bg-mountain-950 fixed h-screen w-full overflow-x-hidden pb-20 print:bg-white print:p-0">
              <div
                style={{
                  visibility:
                    isApiLoading || !isContentReady ? 'hidden' : 'visible',
                }}
                className="mx-auto mt-6 flex min-h-[1123px] w-[794px] min-w-max py-4 pb-20 print:w-full print:py-0"
              >
                <Editor ref={editorRef} onChange={handleEditorChange} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <UnsavedChangesDialog
        open={showExitDialog}
        onConfirm={() => {
          if (pendingNavigation) navigate(pendingNavigation);
          setShowExitDialog(false);
          setPendingNavigation(null);
        }}
        onCancel={() => {
          setShowExitDialog(false);
          setPendingNavigation(null);
        }}
        isCreating={isNewDocument && hasContentForCreation}
      />

      <style>{`
        .loading-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          will-change: transform;
        }
        .loading-spinner-large {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          will-change: transform;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default WriteBlog;
