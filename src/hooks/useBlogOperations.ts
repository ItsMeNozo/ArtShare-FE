// useBlogOperations.ts - Final version
import {
  CreateBlogPayload,
  createNewBlog,
  UpdateBlogPayload,
  updateExistingBlog,
} from '@/features/write-blog/api/blog.api';
import { EditorHandle } from '@/features/write-blog/components/Editor';
import { useSnackbar } from '@/hooks/useSnackbar';
import { AxiosError } from 'axios';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SaveStatus } from './useBlogState';

interface UseBlogOperationsProps {
  updateSaveStatus: (status: SaveStatus, saved?: Date) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  setCreatedDocId: (id: number | null) => void;
  setIsCreating: (value: boolean) => void;
  setIsApiLoading: (value: boolean) => void;
}

export const useBlogOperations = ({
  updateSaveStatus,
  setHasUnsavedChanges,
  setCreatedDocId,
  setIsCreating,
  setIsApiLoading,
}: UseBlogOperationsProps) => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleApiError = useCallback(
    (error: unknown, defaultMessage: string, shouldNavigateAway = true) => {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || defaultMessage
          : error instanceof Error
            ? error.message
            : defaultMessage;

      showSnackbar(errorMessage, 'error');
      console.error(error);
      setIsApiLoading(false);

      if (shouldNavigateAway) {
        navigate('/blogs', { replace: true });
      }
    },
    [showSnackbar, navigate, setIsApiLoading],
  );

  const createDocument = useCallback(
    async (blogTitle: string, editorRef: React.RefObject<EditorHandle>) => {
      console.log('🚀 createDocument function called with:', {
        blogTitle,
        editorContent:
          editorRef.current?.getContent()?.substring(0, 100) + '...',
        editorExists: !!editorRef.current,
      });

      setIsCreating(true);
      updateSaveStatus('saving');

      try {
        const payload: CreateBlogPayload = {
          title: blogTitle?.trim() || 'Untitled Document',
          isPublished: false,
          content: editorRef.current?.getContent() || '',
        };

        console.log('📡 About to call createNewBlog API with payload:', {
          title: payload.title,
          isPublished: payload.isPublished,
          contentLength: payload.content.length,
        });

        const newBlog = await createNewBlog(payload);
        console.log('✅ createNewBlog API call successful, received:', newBlog);

        const lastSavedTime = new Date();
        setCreatedDocId(newBlog.id);

        console.log('🧹 Setting clean state before navigation...');
        setHasUnsavedChanges(false);
        updateSaveStatus('saved', lastSavedTime);

        console.log('🧭 About to navigate to:', `/docs/${newBlog.id}`);

        // --- THE FIX IS APPLIED HERE ---
        navigate(`/docs/${newBlog.id}`, {
          replace: true, // Replaces /docs/new in the browser history
          state: {
            preserveContent: true,
            title: blogTitle,
            justCreated: true,
            initialSaveStatus: 'saved',
            initialLastSaved: lastSavedTime.toISOString(),

            // This line tells the blocker to allow this specific navigation
            skipUnsavedGuard: true,
          },
        });

        console.log('✅ Navigation call completed');
      } catch (error) {
        console.error('❌ Error in createDocument:', error);
        handleApiError(error, 'Failed to create document', false);
        updateSaveStatus('error');
      } finally {
        console.log(
          '🏁 createDocument finally block - setting isCreating to false',
        );
        setIsCreating(false);
      }
    },
    [
      setIsCreating,
      setCreatedDocId,
      navigate,
      setHasUnsavedChanges,
      updateSaveStatus,
      handleApiError,
    ],
  );

  const saveBlog = useCallback(
    async (
      blogId: string,
      title: string,
      editorRef: React.RefObject<EditorHandle>,
    ) => {
      if (!editorRef.current || !blogId) return;

      const content = editorRef.current.getContent();
      const images = editorRef.current.getImages() || [];
      const numericBlogId = parseInt(blogId, 10);

      const payload: UpdateBlogPayload = {
        title: title?.trim() || 'Untitled Document',
        isPublished: true, // Note: This might need to be dynamic if you have a separate publish button
        pictures: images.map((img) => img.src),
        content,
      };

      try {
        updateSaveStatus('saving');
        await updateExistingBlog(numericBlogId, payload);
        updateSaveStatus('saved', new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        updateSaveStatus('error');
        handleApiError(error, 'Failed to save blog.', false);
      }
    },
    [updateSaveStatus, setHasUnsavedChanges, handleApiError],
  );

  return { handleApiError, createDocument, saveBlog };
};
