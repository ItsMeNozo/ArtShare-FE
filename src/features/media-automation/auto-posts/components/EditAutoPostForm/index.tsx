import ConfirmationDialog from '@/components/dialogs/Confirm';
import InlineErrorMessage from '@/components/InlineErrorMessage';
import Loading from '@/components/loading/Loading';
import { useGetProjectDetails } from '@/features/media-automation/projects/hooks/useGetProjectDetails';
import { useFetchPlatforms } from '@/features/media-automation/social-links/hooks/usePlatforms';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';
import { useNumericParam } from '@/hooks/useNumericParam';
import { autoPostKeys, projectKeys } from '@/lib/react-query/query-keys';
import { Box, Button, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { ErrorMessage, Form, Formik, FormikHelpers } from 'formik';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { LuTrash2 } from 'react-icons/lu';
import { TbGridDots } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { MAX_IMAGE_COUNT, MAX_POSTS_PER_PROJECT } from '../../constants';
import { useDeleteAutoPost } from '../../hooks/useDeleteAutoPost';
import { useEditAutoPost } from '../../hooks/useEditAutoPost';
import { useGetAutoPostDetails } from '../../hooks/useGetAutoPostDetails';
import { useGetAutoPosts } from '../../hooks/useGetAutoPosts';
import { AutoPostFormValues, ImageState } from '../../types';
import AIWritingAssistant from './AIWritingAssistant';
import PostContentEditor from './PostContentEditor';
import PostImagesEditor from './PostImagesEditor';
import { FacebookPostPreview } from './PostPreviewer';
import PostScheduleEditor from './PostScheduleEditor';

const EditAutoPostForm = () => {
  const postId = useNumericParam('postId');
  const navigate = useNavigate();
  const projectId = useNumericParam('projectId');
  const [tool, setTool] = useState<string>('preview');
  const {
    isDialogOpen: isNavConfirmOpen,
    itemToConfirm: navTarget,
    openDialog: openNavConfirmDialog,
    closeDialog: closeNavConfirmDialog,
  } = useConfirmationDialog<() => void>();

  const handleNavigation = (dirty: boolean, navigateFn: () => void) => {
    if (dirty) {
      openNavConfirmDialog(() => navigateFn);
    } else {
      navigateFn();
    }
  };

  const handleNavigateToProject = (dirty: boolean) => {
    const targetPath = `/auto/projects/${projectId}/details`;

    handleNavigation(dirty, () => {
      navigate(targetPath);
    });
  };

  const handleAddPost = (dirty: boolean) => {
    handleNavigation(dirty, () =>
      navigate(`/auto/projects/${projectId}/posts/new`),
    );
  };

  const handleNavigateToPost = (
    dirty: boolean,
    targetPostId: number | null,
  ) => {
    if (targetPostId) {
      handleNavigation(dirty, () =>
        navigate(`/auto/projects/${projectId}/posts/${targetPostId}/edit`),
      );
    }
  };

  const queryClient = useQueryClient();

  const { data: postToEdit, isLoading: isLoadingPost } =
    useGetAutoPostDetails(postId);
  const { data: projectDetails, isLoading: isLoadingProject } =
    useGetProjectDetails(projectId);

  const { data: postsResponse, isLoading: isLoadingPostsList } =
    useGetAutoPosts({
      projectId: projectId,
      limit: MAX_POSTS_PER_PROJECT,
      orderBy: 'createdAt',
      order: 'asc',
    });

  const postList = useMemo(
    () => postsResponse?.data ?? [],
    [postsResponse?.data],
  );

  const navigationData = useMemo(() => {
    if (!postList.length || !postId) {
      return { currentPostIndex: -1, prevPostId: null, nextPostId: null };
    }
    const currentPostIndex = postList.findIndex((p) => p.id === postId);
    const prevPostId =
      currentPostIndex > 0 ? postList[currentPostIndex - 1].id : null;
    const nextPostId =
      currentPostIndex < postList.length - 1
        ? postList[currentPostIndex + 1].id
        : null;

    return { currentPostIndex, prevPostId, nextPostId };
  }, [postList, postId]);

  const { data: platforms } = useFetchPlatforms('FACEBOOK');

  const matchedPlatform = useMemo(() => {
    if (!projectDetails || !platforms) {
      return null;
    }

    const platform = platforms.find((p) => p.id === projectDetails.platform.id);

    return platform ?? null;
  }, [projectDetails, platforms]);

  const isProjectLocked = useMemo(() => {
    if (!projectDetails) return true;
    const status = projectDetails.status.toUpperCase();
    return (
      status === 'ACTIVE' ||
      status === 'COMPLETED' ||
      status === 'COMPLETED_WITH_ERRORS'
    );
  }, [projectDetails]);

  const isPostPublished = useMemo(() => {
    if (!postToEdit?.status) return false;
    return postToEdit?.status.toUpperCase() !== 'PENDING';
  }, [postToEdit]);

  const canEdit = !isProjectLocked && !isPostPublished;

  const disabledReason = useMemo(() => {
    if (isProjectLocked) {
      return 'This project is active. Editing is disabled.';
    }
    if (isPostPublished) {
      return 'This post has been published. Editing is disabled.';
    }
    return null;
  }, [isProjectLocked, isPostPublished]);

  const initialValues = useMemo((): AutoPostFormValues => {
    if (postToEdit) {
      const initialImages: ImageState[] = postToEdit.imageUrls.map((url) => ({
        id: url,
        status: 'existing',
        url: url,
      }));

      return {
        content: postToEdit.content,
        images: initialImages,
        scheduledAt: postToEdit.scheduledAt,
      };
    }
    return { content: '', images: [], scheduledAt: new Date() };
  }, [postToEdit]);

  const { mutate: editPost } = useEditAutoPost();

  const handleSubmit = (
    values: AutoPostFormValues,
    formikHelpers: FormikHelpers<AutoPostFormValues>,
  ) => {
    if (!canEdit || !postId) {
      formikHelpers.setSubmitting(false);
      return;
    }
    if (!postId) {
      formikHelpers.setSubmitting(false);
      return;
    }
    editPost(
      {
        id: postId,
        values,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
          queryClient.invalidateQueries({
            queryKey: autoPostKeys.details(postId),
          });
        },
        onSettled: () => formikHelpers.setSubmitting(false),
      },
    );
  };

  const {
    isDialogOpen,
    itemToConfirm: postIdToDelete,
    openDialog,
    closeDialog,
  } = useConfirmationDialog<number>();

  const { mutate: deletePost, isPending: isDeleting } = useDeleteAutoPost({
    projectId: projectId,
    onSuccess: () => {
      closeDialog();
      const currentIndex = postList.findIndex((p) => p.id === postIdToDelete);
      if (currentIndex !== -1) {
        if (postList.length > 1) {
          if (currentIndex > 0) {
            navigate(
              `/auto/projects/${projectId}/posts/${postList[currentIndex - 1].id}/edit`,
            );
          } else {
            navigate(
              `/auto/projects/${projectId}/posts/${postList[currentIndex + 1].id}/edit`,
            );
          }
        } else {
          navigate(`/auto/projects/${projectId}/details`);
        }
      }
    },
  });

  const handleConfirmDelete = () => {
    if (!postIdToDelete) return;
    deletePost(postIdToDelete);
  };

  if (isLoadingPost || isLoadingProject || isLoadingPostsList) {
    return <Loading />;
  }

  if (!postToEdit) {
    return (
      <Box className="flex h-full items-center justify-center">
        <Typography variant="h6" className="text-gray-600">
          Post not found or deleted
        </Typography>
      </Box>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={AutoPostSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue, errors, touched, isSubmitting, dirty }) => {
        return (
          <Form className="flex h-[calc(100vh-4rem)] w-full flex-col rounded-t-3xl bg-[#F2F4F7]">
            <div className="border-mountain-200 flex h-16 w-full shrink-0 items-center rounded-t-3xl border-b-1 bg-white px-4 py-2">
              <div className="flex w-full items-center justify-between">
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-4">
                    <div
                      onClick={() => handleNavigateToProject(dirty)}
                      className="border-mountain-200 flex cursor-pointer items-center space-x-2 rounded-full border bg-indigo-100 p-2 px-4"
                    >
                      <span>Project Posts</span>
                      <TbGridDots />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddPost(dirty)}
                      disabled={
                        postList.length >= MAX_POSTS_PER_PROJECT || !canEdit
                      }
                      className="hover:bg-mountain-50 border-mountain-200 flex cursor-pointer items-center space-x-2 rounded-lg border p-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus />
                      <span>Add New Post</span>
                    </button>
                    <div className="border-mountain-200 flex items-center border-l-1 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() =>
                            handleNavigateToPost(
                              dirty,
                              navigationData.prevPostId,
                            )
                          }
                          disabled={!navigationData.prevPostId}
                          className="border-mountain-200 flex h-10 items-center rounded-lg border bg-white p-2 font-normal text-gray-700 normal-case disabled:opacity-50"
                        >
                          <ChevronLeft className="size-4" />
                          <span>Prev Post</span>
                        </Button>
                        {navigationData.currentPostIndex !== -1 && (
                          <div className="border-mountain-200 flex h-10 items-center rounded-lg border bg-white p-2 text-sm text-gray-500 select-none">
                            <span>{`Post ${
                              navigationData.currentPostIndex + 1
                            } of ${postList.length}`}</span>
                          </div>
                        )}
                        <Button
                          onClick={() =>
                            handleNavigateToPost(
                              dirty,
                              navigationData.nextPostId,
                            )
                          }
                          disabled={!navigationData.nextPostId}
                          className="border-mountain-200 flex h-10 items-center rounded-lg border bg-white p-2 font-normal text-gray-700 normal-case disabled:opacity-50"
                        >
                          <span>Next Post</span>
                          <ChevronRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                {canEdit ? (
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting || !dirty}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => openDialog(postId!)}
                      className="bg-mountain-100 hover:bg-mountain-50 border-mountain-200 flex items-center space-x-2 rounded-lg border p-2"
                    >
                      <LuTrash2 className="size-4" />
                      <div>Delete</div>
                    </Button>
                  </div>
                ) : (
                  disabledReason && (
                    <div className="flex items-center space-x-2 rounded-lg border border-yellow-200 bg-yellow-100 p-2 px-4 text-yellow-800">
                      <ShieldAlert className="size-5" />
                      <span>{disabledReason}</span>
                    </div>
                  )
                )}
              </div>
            </div>
            <Box className="flex h-screen min-h-0 w-full">
              <Box className="border-mountain-200 custom-scrollbar flex min-h-0 w-lg shrink-0 flex-col space-y-8 overflow-x-hidden overflow-y-auto border-r-1 px-2 py-4">
                <Box className="flex flex-col space-y-4">
                  <Typography className="border-mountain-200 flex items-center justify-between space-x-2 border-b-1 py-2 text-indigo-900">
                    <span>🖊️ Post Content</span>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setTool('aiwriting')}
                        className="group flex w-fit cursor-pointer justify-center rounded-lg p-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        style={{
                          background:
                            'linear-gradient(to right, #3b82f6, #6366f1, #a855f7, #ec4899)',
                          color: 'white',
                        }}
                      >
                        <div
                          className={`group-hover:bg-mountain-50 text-mountain-950 flex h-full w-full items-center justify-center rounded-md p-1.5 select-none ${
                            tool === 'aiwriting'
                              ? 'bg-white shadow-sm'
                              : 'bg-white/90'
                          }`}
                        >
                          AI Writing Assistant
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTool('preview')}
                        className={`hover:bg-mountain-50 border-mountain-200 text-mountain-950 flex h-full w-fit cursor-pointer items-center justify-center space-x-2 rounded-md border p-1.5 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                          tool === 'preview'
                            ? 'border-indigo-300 shadow-sm'
                            : 'bg-white'
                        }`}
                      >
                        <Eye className="size-4" />
                        <span>Preview</span>
                      </button>
                    </div>
                  </Typography>
                  <PostContentEditor
                    value={values.content}
                    onChange={(content: string) =>
                      setFieldValue('content', content)
                    }
                    canEdit={canEdit}
                  />
                  <ErrorMessage name="content">
                    {(msg) => <InlineErrorMessage errorMsg={msg} />}
                  </ErrorMessage>
                </Box>
                <Box className="flex flex-col space-y-4">
                  <div className="border-mountain-200 flex items-center space-x-2 border-b-1 py-2 text-indigo-900">
                    <p>🖼️</p>
                    <p>Post Images</p>
                  </div>
                  <PostImagesEditor
                    images={values.images}
                    onImagesChange={(newImages) =>
                      setFieldValue('images', newImages)
                    }
                    isInvalid={!!(errors.images && touched.images)}
                    canEdit={canEdit}
                  />
                  <ErrorMessage name="images">
                    {(msg) => <InlineErrorMessage errorMsg={msg} />}
                  </ErrorMessage>
                </Box>
                <Box className="flex flex-col space-y-4">
                  <Typography className="border-mountain-200 flex items-center space-x-2 border-b py-2 font-medium text-indigo-900">
                    <span className="mr-2">📅</span> Post Scheduling
                  </Typography>
                  <PostScheduleEditor
                    value={values.scheduledAt}
                    onChange={(date) => setFieldValue('scheduledAt', date)}
                    canEdit={canEdit}
                  />
                  <ErrorMessage name="scheduledAt">
                    {(msg) => <InlineErrorMessage errorMsg={msg} />}
                  </ErrorMessage>
                </Box>
              </Box>
              {tool === 'preview' ? (
                <FacebookPostPreview
                  content={values.content}
                  images={values.images.map((img) => img.url)}
                  scheduledAt={values.scheduledAt}
                  platform={matchedPlatform!}
                />
              ) : (
                <AIWritingAssistant />
              )}
            </Box>
            <ConfirmationDialog
              open={isDialogOpen}
              onCancel={closeDialog}
              onConfirm={handleConfirmDelete}
              title="Confirm Deletion"
              description="Are you sure you want to permanently delete this post? This action cannot be undone."
              confirmMessage="Delete Post"
              isLoading={isDeleting}
            />
            <ConfirmationDialog
              open={isNavConfirmOpen}
              onCancel={closeNavConfirmDialog}
              onConfirm={() => {
                if (navTarget) {
                  navTarget();
                }
                closeNavConfirmDialog();
              }}
              title="Unsaved Changes"
              description="You have unsaved changes. Are you sure you want to go to another post? Your changes will be lost."
              confirmMessage="Yes"
            />
          </Form>
        );
      }}
    </Formik>
  );
};

export default EditAutoPostForm;

const AutoPostSchema = Yup.object().shape({
  content: Yup.string()
    .required('Post content cannot be empty.')
    .test(
      'has-text',
      'Post content cannot be empty.',
      (value) => !!value?.replace(/<[^>]+>/g, '').trim(),
    ),
  images: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.string().required(),
        status: Yup.string().required(),
        url: Yup.string().required(),
        file: Yup.mixed().optional(),
      }),
    )
    .max(
      MAX_IMAGE_COUNT,
      `You can upload a maximum of ${MAX_IMAGE_COUNT} images.`,
    ),
  scheduledAt: Yup.date().optional().nullable(),
});
