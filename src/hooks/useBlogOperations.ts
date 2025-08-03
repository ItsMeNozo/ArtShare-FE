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
      setIsCreating(true);
      try {
        const payload: CreateBlogPayload = {
          title: blogTitle?.trim() || 'Untitled Document',
          isPublished: false,
          content: editorRef.current?.getContent() || '',
        };

        const newBlog = await createNewBlog(payload);
        setCreatedDocId(newBlog.id);

        navigate(`/docs/${newBlog.id}`, {
          replace: true,
          state: { preserveContent: true, title: blogTitle },
        });

        setHasUnsavedChanges(false);
        updateSaveStatus('saved', new Date());
      } catch (error) {
        handleApiError(error, 'Failed to create document', false);
        updateSaveStatus('error');
      } finally {
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
        isPublished: true,
        pictures: images.map((img) => img.src),
        content,
      };

      try {
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
