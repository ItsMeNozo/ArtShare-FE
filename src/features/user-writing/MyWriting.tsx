import { TUTORIAL_TEMPLATE_HTML } from '@/constants/template';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Blog } from '@/types/blog';
import { AxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useBeforeUnload,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
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

// Move dialog component outside to prevent recreation on every render
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

  // Memoize search params to prevent recreation
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
  const [initialFetchedContent, setInitialFetchedContent] = useState<
    string | null
  >(
    isNewDocument
      ? templateType === 'tutorial'
        ? TUTORIAL_TEMPLATE_HTML
        : ''
      : null,
  );
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

  // Memoize content checking function
  const hasContentToSave = useCallback(() => {
    const content = editorRef.current?.getContent() || '';
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.length > 0;
  }, []);

  // Memoize beforeunload callback
  const beforeUnloadCallback = useCallback(
    (event: BeforeUnloadEvent) => {
      if (isNewDocument && hasContentToSave()) {
        event.preventDefault();
        return (event.returnValue =
          'You have unsaved changes. Are you sure you want to leave?');
      }
      if (!isNewDocument && hasUnsavedChanges) {
        event.preventDefault();
        return (event.returnValue =
          'You have unsaved changes. Are you sure you want to leave?');
      }
    },
    [isNewDocument, hasContentToSave, hasUnsavedChanges],
  );

  // Debounce timer ref for new doc creation
  const createDocDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize editor change handler with debounce for new doc creation
  const handleEditorChange = useCallback(() => {
    const hasContent = hasContentToSave();
    setHasContentForCreation(hasContent);

    if (isNewDocument && !createdDocId && !isCreating && hasContent) {
      // Debounce the creation API call
      if (createDocDebounceRef.current) {
        clearTimeout(createDocDebounceRef.current);
      }
      createDocDebounceRef.current = setTimeout(async () => {
        // Double-check state before creating
        if (!createdDocId && !isCreating) {
          // Lock creation
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
            // Do NOT clear or reset editor content while waiting for backend
            // Fetch the blog from backend to ensure content is in sync, but only update if different
            try {
              const fetchedBlog = await fetchBlogDetails(newBlog.id);
              setBlogTitle(fetchedBlog.title || 'Untitled Document');
              setIsPublished(fetchedBlog.isPublished || false);
              if (
                editorRef.current &&
                typeof fetchedBlog.content === 'string'
              ) {
                const currentContent = editorRef.current.getContent() || '';
                // Only update if backend content is different from what user typed
                if (fetchedBlog.content !== currentContent) {
                  editorRef.current.setContent(fetchedBlog.content);
                }
              }
            } catch (fetchError) {
              // If fetch fails, keep local content
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
      }, 500); // 500ms debounce
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

  // Memoize title change handler
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setBlogTitle(newTitle);
      if (!isNewDocument && blogId !== 'new') {
        setHasUnsavedChanges(true);
      }
    },
    [isNewDocument, blogId],
  );

  // Memoize navigation handlers
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

  // Memoize export handler
  const handleExportDocument = useCallback(async () => {
    if (!editorRef.current || !blogId) return;

    const link = `http://localhost:5173/blogs/${blogId}`;
    try {
      await navigator.clipboard.writeText(link);
      setTooltipOpen(true);
      setTimeout(() => {
        setTooltipOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  }, [blogId]);

  // Memoize save handler
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

  // MOVE ALL USEMEMO CALLS HERE - BEFORE ANY CONDITIONAL LOGIC OR EARLY RETURNS

  // Memoize status component
  const statusComponent = useMemo(
    () => <AutoSaveStatus status={saveStatus} lastSaved={lastSaved} />,
    [saveStatus, lastSaved],
  );

  // Memoize loading component
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

  // Memoize status indicator
  const statusIndicator = useMemo(() => {
    if (!isNewDocument || createdDocId) return null;

    return (
      <div className="mx-auto mt-2 mb-4 w-[794px] border-l-4 border-blue-400 bg-blue-50 p-3 dark:bg-blue-900/20">
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {isCreating ? (
                <span className="flex items-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-blue-500"></div>
                  Creating document...
                </span>
              ) : (
                'Start typing to create your document'
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }, [isNewDocument, createdDocId, isCreating]);

  // Browser beforeunload warning
  useBeforeUnload(beforeUnloadCallback);

  // Auto-save effect for existing documents
  useEffect(() => {
    // Skip auto-save if we just created this document and are transitioning
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
          console.log('Auto-saved successfully');
        } catch (error) {
          console.error('Auto-save failed:', error);
          setSaveStatus('error');
        }
      }
    }, 5000);

    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges, blogId, blogTitle, isCreating, createdDocId]);

  // Navigation guard for programmatic navigation
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isNewDocument && hasContentForCreation) {
        event.preventDefault();
        event.returnValue = '';
      }
      if (!isNewDocument && hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isNewDocument, hasContentForCreation, hasUnsavedChanges]);

  // Load existing document
  useEffect(() => {
    if (isNewDocument) {
      setIsApiLoading(false);
      if (editorRef.current) {
        const content =
          templateType === 'tutorial' ? TUTORIAL_TEMPLATE_HTML : '';
        editorRef.current.setContent(content);
        requestAnimationFrame(() => {
          editorRef.current?.focus();
        });
      }
      return;
    }

    // Skip the entire effect if we just created this document - we already have the data and content loaded
    if (createdDocId && blogId === createdDocId.toString()) {
      // Only set state, do NOT reset editor content
      setIsApiLoading(false);
      setIsContentLoadedIntoEditor(true);
      return;
    }

    if (!blogId) {
      showSnackbar('No blog ID provided.', 'error');
      navigate('/blogs', { replace: true });
      return;
    }

    setIsApiLoading(true);
    setIsContentLoadedIntoEditor(false);
    setInitialFetchedContent(null);
    const numericBlogId = parseInt(blogId, 10);

    if (isNaN(numericBlogId)) {
      showSnackbar('Invalid blog ID format.', 'error');
      navigate('/blogs', { replace: true });
      setIsApiLoading(false);
      return;
    }

    fetchBlogDetails(numericBlogId)
      .then((fetchedBlog: Blog) => {
        setBlogTitle(fetchedBlog.title || 'Untitled Document');
        setIsPublished(fetchedBlog.isPublished || false);
        const contentToSet = fetchedBlog.content || '';
        setInitialFetchedContent(contentToSet);

        if (editorRef.current) {
          editorRef.current.setContent(contentToSet);
          setIsContentLoadedIntoEditor(true);
          requestAnimationFrame(() => {
            editorRef.current?.focus();
          });
        }
      })
      .catch((error: unknown) => {
        console.error('Error fetching blog content:', error);
        let errorMessage = 'Failed to load blog content.';
        if (error instanceof AxiosError) {
          errorMessage = error.response?.data?.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        showSnackbar(errorMessage, 'error');
        navigate('/blogs', { replace: true });
      })
      .finally(() => {
        setIsApiLoading(false);
      });
  }, [
    blogId,
    navigate,
    showSnackbar,
    isNewDocument,
    templateType,
    createdDocId,
  ]);

  // Content loading effect
  useEffect(() => {
    if (
      !isApiLoading &&
      editorRef.current &&
      initialFetchedContent !== null &&
      !isContentLoadedIntoEditor
    ) {
      const currentContent = editorRef.current.getContent() || '';
      // For new documents, never set content to '' if user has typed anything
      if (isNewDocument) {
        if (initialFetchedContent && initialFetchedContent !== currentContent) {
          editorRef.current.setContent(initialFetchedContent);
        }
        // If initialFetchedContent is '', do NOT set (never clear user input)
      } else {
        // For existing docs, only set if backend content is different
        if (initialFetchedContent !== currentContent) {
          editorRef.current.setContent(initialFetchedContent);
        }
      }
      setIsContentLoadedIntoEditor(true);
      requestAnimationFrame(() => {
        editorRef.current?.focus();
      });
    }
  }, [
    isApiLoading,
    initialFetchedContent,
    isContentLoadedIntoEditor,
    isNewDocument,
  ]);

  // Optimized focus effect - reduced number of attempts
  useEffect(() => {
    if (isContentLoadedIntoEditor && editorRef.current && !isApiLoading) {
      // Single focus attempt after content is loaded
      const timeoutId = setTimeout(() => {
        editorRef.current?.focus();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isContentLoadedIntoEditor, isApiLoading]);

  // NOW THE EARLY RETURN CAN HAPPEN AFTER ALL HOOKS ARE CALLED
  if (isApiLoading) {
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
              {statusIndicator}

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
