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

// Enhanced AutoSaveStatus component that handles new document state
const EnhancedAutoSaveStatus = ({
  status,
  lastSaved,
  isNewDocument,
  createdDocId,
  isCreating,
  hasContent,
}: {
  status: 'saved' | 'saving' | 'unsaved' | 'error';
  lastSaved?: Date;
  isNewDocument: boolean;
  createdDocId: number | null;
  isCreating: boolean;
  hasContent: boolean;
}) => {
  // For new documents that haven't been created yet
  if (isNewDocument && !createdDocId) {
    if (isCreating) {
      return (
        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
          <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <span>Creating document...</span>
        </div>
      );
    }

    if (!hasContent) {
      return (
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
          <span>Start typing to create document</span>
        </div>
      );
    }
  }

  // For existing documents or created documents, use the original AutoSaveStatus
  return <AutoSaveStatus status={status} lastSaved={lastSaved} />;
};

const UnsavedChangesDialog = ({
  open,
  onConfirm,
  onCancel,
  isCreating = false,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isCreating?: boolean;
}) => {
  if (!open) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="dark:bg-mountain-800 mx-4 w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          {isCreating ? 'Discard document?' : 'Discard unsaved changes?'}
        </h3>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {isCreating
            ? 'Your document will be created once you start typing. Are you sure you want to leave?'
            : 'You have unsaved changes that will be lost if you leave this page.'}
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
            {isCreating ? 'Leave' : 'Discard'}
          </button>
        </div>
      </div>
    </div>
  );
};

const WriteBlog = () => {
  const editorRef = useRef<EditorHandle>(null);
  const { showSnackbar } = useSnackbar();
  const { blogId } = useParams<{ blogId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const isNewDocument = blogId === 'new';
  const templateType = searchParams.get('template');

  const [blogTitle, setBlogTitle] = useState('Untitled Document');
  const [isApiLoading, setIsApiLoading] = useState(!isNewDocument);
  const [isContentLoadedIntoEditor, setIsContentLoadedIntoEditor] =
    useState(isNewDocument);
  const [isPublished, setIsPublished] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    'saved' | 'saving' | 'unsaved' | 'error'
  >('saved');
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);

  // New document creation states
  const [createdDocId, setCreatedDocId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [hasContentForCreation, setHasContentForCreation] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );

  const hasContentToSave = useCallback(() => {
    const content = editorRef.current?.getContent() || '';
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.length > 0;
  }, []);

  const createDocDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const titleSaveDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleEditorChange = useCallback(() => {
    const hasContent = hasContentToSave();
    setHasContentForCreation(hasContent);

    if (isNewDocument && !createdDocId && !isCreating && hasContent) {
      if (createDocDebounceRef.current) {
        clearTimeout(createDocDebounceRef.current);
      }
      createDocDebounceRef.current = setTimeout(async () => {
        if (!createdDocId && !isCreating) {
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
            try {
              const fetchedBlog = await fetchBlogDetails(newBlog.id);
              setBlogTitle(fetchedBlog.title || 'Untitled Document');
              setIsPublished(fetchedBlog.isPublished || false);
              if (
                editorRef.current &&
                typeof fetchedBlog.content === 'string'
              ) {
                const currentContent = editorRef.current.getContent() || '';
                if (fetchedBlog.content !== currentContent) {
                  editorRef.current.setContent(fetchedBlog.content);
                }
              }
            } catch (fetchError) {
              console.error('Failed to fetch blog after creation:', fetchError);
            }
            setHasUnsavedChanges(false);
            setIsContentLoadedIntoEditor(true);
            setIsApiLoading(false);
          } catch (error) {
            showSnackbar('Failed to create document', 'error');
            console.error('Error creating document:', error);
          } finally {
            setIsCreating(false);
          }
        }
      }, 500);
      return;
    }

    if (!isNewDocument && blogId !== 'new') {
      setHasUnsavedChanges(true);
    }
  }, [
    isNewDocument,
    createdDocId,
    isCreating,
    blogTitle,
    blogId,
    navigate,
    showSnackbar,
    hasContentToSave,
  ]);

  const handleTitleChange = useCallback(
    async (newTitle: string) => {
      setBlogTitle(newTitle);

      // For existing documents, save title with short debounce (like Google Docs)
      if (!isNewDocument && blogId !== 'new' && blogId) {
        const numericBlogId = parseInt(blogId, 10);
        if (!isNaN(numericBlogId)) {
          // Clear previous debounce
          if (titleSaveDebounceRef.current) {
            clearTimeout(titleSaveDebounceRef.current);
          }

          // Set unsaved state immediately for visual feedback
          setHasUnsavedChanges(true);
          setSaveStatus('unsaved');

          // Debounce the actual save for 800ms (faster than content auto-save)
          titleSaveDebounceRef.current = setTimeout(async () => {
            setSaveStatus('saving');
            try {
              await updateExistingBlog(numericBlogId, {
                title: newTitle.trim() || 'Untitled Document',
                isPublished: false,
              });
              setSaveStatus('saved');
              setLastSaved(new Date());
              setHasUnsavedChanges(false);
            } catch (error) {
              console.error('Failed to save title:', error);
              setSaveStatus('error');
              setHasUnsavedChanges(true);
            }
          }, 800);
        }
      }
    },
    [isNewDocument, blogId],
  );

  const handleConfirmNavigation = useCallback(() => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setShowExitDialog(false);
    setPendingNavigation(null);
  }, [navigate, pendingNavigation]);

  const handleCancelNavigation = useCallback(() => {
    setShowExitDialog(false);
    setPendingNavigation(null);
  }, []);

  const handleExportDocument = useCallback(async () => {
    if (!editorRef.current || !blogId) return;
    const link = `http://localhost:5173/blogs/${blogId}`;
    try {
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

      setSaveStatus('saving');
      const content = editorRef.current?.getContent();
      const images = editorRef.current?.getImages() || [];
      const numericBlogId = parseInt(blogId, 10);
      const titleToSave = currentTitle.trim() || 'Untitled Document';

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
        setSaveStatus('saved');
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        navigate(`/blogs/${updatedBlog.id}`);
      } catch (error: unknown) {
        setSaveStatus('error');
        let errorMessage = 'Failed to save blog.';
        if (error instanceof AxiosError) {
          errorMessage = error.response?.data?.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        showSnackbar(errorMessage, 'error');
      }
    },
    [blogId, navigate, showSnackbar],
  );

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

  const loadingComponent = useMemo(
    () => (
      <div className="dark:bg-mountain-950 flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500 dark:border-blue-400"></div>
          <span className="text-gray-700 dark:text-gray-300">
            Loading editor data...
          </span>
        </div>
      </div>
    ),
    [],
  );

  useEffect(() => {
    return () => {
      if (titleSaveDebounceRef.current) {
        clearTimeout(titleSaveDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isCreating || (createdDocId && blogId === createdDocId.toString())) {
      return;
    }
    if (!hasUnsavedChanges || !blogId || blogId === 'new') return;
    setSaveStatus('unsaved');
    const autoSaveTimer = setTimeout(async () => {
      const content = editorRef.current?.getContent();
      if (content && blogId !== 'new') {
        setSaveStatus('saving');
        try {
          await updateExistingBlog(parseInt(blogId, 10), {
            content,
            title: blogTitle,
            isPublished: false,
          });
          setHasUnsavedChanges(false);
          setSaveStatus('saved');
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
          setSaveStatus('error');
        }
      }
    }, 2000);
    return () => {
      clearTimeout(autoSaveTimer);
      if (titleSaveDebounceRef.current) {
        clearTimeout(titleSaveDebounceRef.current);
      }
    };
  }, [hasUnsavedChanges, blogId, blogTitle, isCreating, createdDocId]);

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
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isNewDocument, hasContentForCreation, hasUnsavedChanges]);

  useEffect(() => {
    const loadBlog = async () => {
      if (isNewDocument) {
        setIsApiLoading(false);
        const content =
          templateType === 'tutorial' ? TUTORIAL_TEMPLATE_HTML : '';
        if (editorRef.current && !editorRef.current.getContent()) {
          editorRef.current.setContent(content);
        }
        setIsContentLoadedIntoEditor(true);
        return;
      }
      if (!blogId || (createdDocId && blogId === createdDocId.toString())) {
        setIsApiLoading(false);
        setIsContentLoadedIntoEditor(true);
        return;
      }
      const numericBlogId = parseInt(blogId, 10);
      if (isNaN(numericBlogId)) {
        showSnackbar('Invalid blog ID format.', 'error');
        navigate('/blogs', { replace: true });
        return;
      }
      setIsApiLoading(true);
      try {
        const fetchedBlog = await fetchBlogDetails(numericBlogId);
        setBlogTitle(fetchedBlog.title || 'Untitled Document');
        setIsPublished(fetchedBlog.isPublished || false);
        const contentToSet = fetchedBlog.content || '';
        if (
          editorRef.current &&
          editorRef.current.getContent() !== contentToSet
        ) {
          editorRef.current.setContent(contentToSet);
        }
        setIsContentLoadedIntoEditor(true);
      } catch (error) {
        console.error('Error fetching blog content:', error);
        let errorMessage = 'Failed to load blog content.';
        if (error instanceof AxiosError) {
          errorMessage = error.response?.data?.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        showSnackbar(errorMessage, 'error');
        navigate('/blogs', { replace: true });
      } finally {
        setIsApiLoading(false);
      }
    };
    loadBlog();
  }, [
    blogId,
    navigate,
    showSnackbar,
    isNewDocument,
    templateType,
    createdDocId,
  ]);

  useEffect(() => {
    if (isContentLoadedIntoEditor && !isApiLoading && editorRef.current) {
      const timeoutId = setTimeout(() => {
        editorRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isContentLoadedIntoEditor, isApiLoading]);

  if (isApiLoading && !isContentLoadedIntoEditor) {
    return loadingComponent;
  }

  return (
    <>
      <div className="dark:bg-mountain-950 flex h-full w-full flex-row bg-white">
        <div className="flex h-full w-[calc(100vw-16rem)] flex-1 flex-shrink flex-col">
          <TextEditorHeader
            handleExport={handleExportDocument}
            handleSaveBlog={handleSaveBlog}
            text={blogTitle}
            setText={handleTitleChange}
            isPublished={isPublished}
            tooltipOpen={tooltipOpen}
            saveStatus={statusComponent}
          />
          <div className="bg-mountain-50 dark:bg-mountain-900 border-l-mountain-100 dark:border-l-mountain-700 h-full w-full border-l-1">
            <Toolbar />
            <div className="dark:print:bg-mountain-950 sidebar fixed h-screen w-full overflow-x-hidden pb-20 print:bg-white print:p-0">
              <div className="mx-auto mt-6 flex min-h-[1123px] w-[794px] min-w-max overflow-y-hidden py-4 pb-20 print:w-full print:py-0">
                <Editor ref={editorRef} onChange={handleEditorChange} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <UnsavedChangesDialog
        open={showExitDialog}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
        isCreating={isNewDocument && hasContentForCreation}
      />
    </>
  );
};

export default WriteBlog;
