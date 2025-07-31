import { UnsavedChangesProtector } from '@/components/UnsavedChangesProtector';
import { TUTORIAL_TEMPLATE_HTML } from '@/constants/template';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useBlogOperations } from '@/hooks/useBlogOperations';
import { useBlogState } from '@/hooks/useBlogState';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { fetchBlogDetails } from '../blog-details/api/blog';
import Editor, { EditorHandle } from './components/Editor';
import {
  EnhancedAutoSaveStatus,
  LoadingScreen,
} from './components/StatusComponents';
import TextEditorHeader from './components/TextEditorHeader';
import Toolbar from './components/Toolbar';

const WriteBlog = () => {
  const editorRef = useRef<EditorHandle>(null);
  const isInitializedRef = useRef(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [wasJustCreated, setWasJustCreated] = useState(false);

  const { blogId } = useParams<{ blogId: string }>();
  const location = useLocation();

  const templateType = new URLSearchParams(location.search).get('template');
  const isNewDocument = blogId === 'new';
  const preloadedTitle = location.state?.title;
  const preserveContent = location.state?.preserveContent;
  const justCreated = location.state?.justCreated;
  const initialSaveStatus = location.state?.saveStatus;
  const initialLastSaved = location.state?.lastSaved;

  console.log('🏗️ WriteBlog component rendered with:', {
    blogId,
    pathname: location.pathname,
    locationState: location.state,
    justCreated,
    initialSaveStatus,
  });

  const blogState = useBlogState(preloadedTitle || (isNewDocument ? '' : ''));
  const {
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
  } = blogState;

  // ✅ DEBUG: Now that variables are declared, we can use them
  useEffect(() => {
    console.log('📊 State update:', {
      createdDocId,
      isCreating,
      hasUnsavedChanges,
      wasJustCreated,
      blogId,
    });
  }, [createdDocId, isCreating, hasUnsavedChanges, wasJustCreated, blogId]);

  const blogOperations = useBlogOperations({
    updateSaveStatus,
    setHasUnsavedChanges,
    setCreatedDocId,
    setIsCreating,
    setIsApiLoading,
  });

  const autoSave = useAutoSave({
    blogId,
    blogTitle,
    hasUnsavedChanges,
    isCreating,
    isNewDocument,
    updateSaveStatus,
    setHasUnsavedChanges,
    editorRef,
    isDialogOpen,
  });

  const hasContentToSave = useCallback(() => {
    const content = editorRef.current?.getContent() || '';
    return content.replace(/<[^>]*>/g, '').trim().length > 0;
  }, []);

  // ✅ FIXED: Handle justCreated state immediately when component mounts
  useEffect(() => {
    console.log('🔄 justCreated useEffect triggered with:', {
      blogId,
      justCreated,
      initialSaveStatus,
      locationState: location.state,
      pathname: location.pathname,
    });

    if (justCreated) {
      console.log('🎯 Document was just created - setting clean state');
      setHasUnsavedChanges(false);
      setWasJustCreated(true);
      setHasContentForCreation(true);
      if (initialSaveStatus) {
        updateSaveStatus(initialSaveStatus, initialLastSaved);
      }
      console.log('✅ Clean state set for just-created document');
    } else {
      console.log('⚠️ justCreated is false/undefined, not setting clean state');
    }
  }, [
    blogId,
    justCreated,
    initialSaveStatus,
    initialLastSaved,
    setHasUnsavedChanges,
    updateSaveStatus,
    location.state,
    location.pathname,
  ]);

  const handleEditorChange = useCallback(() => {
    console.log('📝 Editor changed:', {
      wasJustCreated,
      isNewDocument,
      blogId,
      isCreating,
      createdDocId,
      hasUnsavedChanges,
    });

    autoSave.triggerContentCapture();

    const hasContent = hasContentToSave();
    setHasContentForCreation(hasContent);

    if (wasJustCreated && isInitializedRef.current) {
      console.log(
        '🔄 User made changes after creation - clearing wasJustCreated flag',
      );
      setWasJustCreated(false);
    }

    autoSave.markChangesWhileSaving();

    if (isNewDocument && !createdDocId && !isCreating && hasContent) {
      console.log('🆕 Creating new document with debounce...', {
        blogTitle,
        hasContent,
        createdDocId,
        isCreating,
        debounceDelay: autoSave.delays.create,
      });

      autoSave.createDebounce(() => {
        console.log('⚡ Debounced createDocument triggered');
        return blogOperations.createDocument(blogTitle, editorRef);
      }, autoSave.delays.create);
      return;
    }

    if (!isNewDocument && blogId !== 'new' && blogId && !wasJustCreated) {
      console.log('💾 Marking existing document as unsaved');
      setHasUnsavedChanges(true);
    } else if (!isNewDocument && blogId !== 'new' && blogId && wasJustCreated) {
      console.log('⏸️ Skipping unsaved marking - document was just created');
    }
  }, [
    autoSave,
    hasContentToSave,
    setHasContentForCreation,
    wasJustCreated,
    setWasJustCreated,
    isNewDocument,
    createdDocId,
    isCreating,
    blogTitle,
    blogOperations,
    blogId,
    setHasUnsavedChanges,
    hasUnsavedChanges,
  ]);

  const handleTitleChange = useCallback(
    async (newTitle: string) => {
      setBlogTitle(newTitle);

      if (!isNewDocument && blogId !== 'new' && blogId) {
        const numericBlogId = parseInt(blogId, 10);
        if (isNaN(numericBlogId)) return;

        setHasUnsavedChanges(true);

        const abortableTitleSave = autoSave.createAbortableTitleSave(
          numericBlogId,
          newTitle,
        );
        autoSave.titleSaveDebounce(
          abortableTitleSave,
          autoSave.delays.titleSave,
        );
      }
    },
    [isNewDocument, blogId, setBlogTitle, setHasUnsavedChanges, autoSave],
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
  }, [blogId, setTooltipOpen]);

  const handleSaveBlog = useCallback(
    (currentTitle: string) => {
      autoSave.triggerContentCapture();
      blogOperations.saveBlog(blogId!, currentTitle, editorRef);
    },
    [blogId, blogOperations, autoSave],
  );

  const isDirty = useMemo(() => {
    const state = {
      wasJustCreated,
      isNewDocument,
      hasContentForCreation,
      hasUnsavedChanges,
      blogId,
      justCreated,
      pathname: location.pathname,
    };

    console.log('🔍 isDirty calculation with full state:', state);

    if (wasJustCreated) {
      console.log(
        '✅ Document was just created - not dirty (wasJustCreated=true)',
      );
      return false;
    }

    if (!isNewDocument) {
      const dirty = hasUnsavedChanges;
      console.log('📝 Existing document dirty check:', {
        dirty,
        hasUnsavedChanges,
      });
      return dirty;
    }

    const dirty = hasContentForCreation;
    console.log('🆕 New document dirty check:', {
      dirty,
      hasContentForCreation,
    });
    return dirty;
  }, [
    isNewDocument,
    hasContentForCreation,
    hasUnsavedChanges,
    wasJustCreated,
    blogId,
    justCreated,
    location.pathname,
  ]);

  const isPublishDisabled = useMemo(() => {
    return !blogTitle?.trim() || !hasContentForCreation;
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

  // Initialize editor content
  useEffect(() => {
    const initializeEditor = async () => {
      if (preserveContent && isInitializedRef.current) {
        setIsApiLoading(false);
        setIsContentReady(true);
        return;
      }

      if (isNewDocument) {
        const content =
          templateType === 'tutorial' ? TUTORIAL_TEMPLATE_HTML : '';
        if (editorRef.current && !isInitializedRef.current) {
          editorRef.current.setContent(content);
          isInitializedRef.current = true;
        }
        setIsApiLoading(false);
        setIsContentReady(true);
        return;
      }

      if (!blogId || isInitializedRef.current) return;

      try {
        const numericBlogId = parseInt(blogId, 10);
        if (isNaN(numericBlogId)) throw new Error('Invalid blog ID');

        const blog = await fetchBlogDetails(numericBlogId);
        setBlogTitle(blog.title || 'Untitled Document');
        setIsPublished(blog.isPublished || false);

        if (editorRef.current) {
          editorRef.current.setContent(blog.content || '');
          isInitializedRef.current = true;
        }
      } catch (error) {
        blogOperations.handleApiError(error, 'Failed to load blog content.');
      } finally {
        setIsApiLoading(false);
        setIsContentReady(true);
      }
    };

    initializeEditor();
  }, [
    blogId,
    isNewDocument,
    templateType,
    preserveContent,
    setBlogTitle,
    setIsPublished,
    setIsApiLoading,
    setIsContentReady,
    blogOperations,
  ]);

  // Focus editor when ready
  useEffect(() => {
    if (isContentReady && !isApiLoading && editorRef.current) {
      const timeoutId = setTimeout(() => editorRef.current?.focus(), 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isContentReady, isApiLoading]);

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        setIsDialogOpen(true);
        event.preventDefault();
        event.returnValue = '';
      }
    };

    const handleUnload = () => setIsDialogOpen(false);

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [isDirty]);

  const titleDisplay = blogTitle || 'Untitled Document';
  const isTitleEmpty = !blogTitle?.trim();

  return (
    <>
      <UnsavedChangesProtector
        isDirty={isDirty}
        onDialogStateChange={setIsDialogOpen}
        onStay={async () => {
          if (!isNewDocument && blogId && blogTitle && hasUnsavedChanges) {
            await autoSave.performAutoSave();
          }
        }}
      />

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
                <Editor
                  ref={editorRef}
                  onChange={handleEditorChange}
                  setHasUnsavedChanges={setHasUnsavedChanges}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

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
