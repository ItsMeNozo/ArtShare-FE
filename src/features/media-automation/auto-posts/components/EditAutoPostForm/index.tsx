import ConfirmationDialog from '@/components/dialogs/Confirm';
import InlineErrorMessage from '@/components/InlineErrorMessage';
import Loading from '@/components/loading/Loading';
import { useGetProjectDetails } from '@/features/media-automation/projects/hooks/useGetProjectDetails';
import { Platform } from '@/features/media-automation/projects/types/platform';
import { useFetchPlatforms } from '@/features/media-automation/social-links/hooks/usePlatforms';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';
import { useNumericParam } from '@/hooks/useNumericParam';
import { Box, Button, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { ErrorMessage, Form, Formik, FormikHelpers } from 'formik';
import { ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { LuTrash2 } from 'react-icons/lu';
import { PiStarFourFill } from 'react-icons/pi';
import { TbGridDots } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { MAX_IMAGE_COUNT, MAX_POSTS_PER_PROJECT } from '../../constants';
import { useDeleteAutoPost } from '../../hooks/useDeleteAutoPost';
import { useEditAutoPost } from '../../hooks/useEditAutoPost';
import { useGetAutoPostDetails } from '../../hooks/useGetAutoPostDetails';
import { useGetAutoPosts } from '../../hooks/useGetAutoPosts';
import { AutoPostFormValues, ImageState } from '../../types';
import PostContentEditor from './PostContentEditor';
import PostImagesEditor from './PostImagesEditor';
import { FacebookPostPreview } from './PostPreviewer';
import PostScheduleEditor from './PostScheduleEditor';

// import { Link, Element } from "react-scroll";

const EditAutoPostForm = () => {
  const postId = useNumericParam('postId');
  const navigate = useNavigate();
  const projectId = useNumericParam('projectId');

  const handleNavigateToProject = () => {
    navigate(`/auto/projects/${projectId}/details`);
  };

  const handleAddPost = () => {
    navigate(`/auto/projects/${projectId}/posts/new`);
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

  const handleNavigateToPost = (targetPostId: number | null) => {
    if (targetPostId) {
      navigate(`/auto/projects/${projectId}/posts/${targetPostId}/edit`);
    }
  };

  const { data: platforms } = useFetchPlatforms('FACEBOOK');

  const [matchedPlatform, setMatchedPlatform] = useState<Platform | null>(null);

  const canEdit = useMemo(() => {
    if (!projectDetails) return false;

    const status = projectDetails.status.toUpperCase();
    const isLocked =
      status === 'ACTIVE' ||
      status === 'COMPLETED' ||
      status === 'COMPLETED_WITH_ERRORS';

    return !isLocked;
  }, [projectDetails]);

  useEffect(() => {
    if (!postToEdit?.platformPostId || !platforms) return;
    const [platformExternalId] = postToEdit.platformPostId.split('_');
    const matched = platforms.find(
      (p) => String(p.externalPageId) === platformExternalId,
    );
    setMatchedPlatform(matched ?? null);
  }, [postToEdit, platforms]);

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
          queryClient.invalidateQueries({ queryKey: ['projects', 'list'] });
          queryClient.invalidateQueries({
            queryKey: ['auto-post', 'details', postId],
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
    onSuccess: () => {
      closeDialog();
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
                      onClick={handleNavigateToProject}
                      className="border-mountain-200 flex cursor-pointer items-center space-x-2 rounded-full border bg-indigo-100 p-2 px-4"
                    >
                      <span>Project Posts</span>
                      <TbGridDots />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPost}
                      disabled={
                        postList.length >= MAX_POSTS_PER_PROJECT || !canEdit
                      }
                      className="hover:bg-mountain-50 border-mountain-200 flex cursor-pointer items-center space-x-2 rounded-lg border p-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <PiStarFourFill className="size-4 text-purple-600" />
                      <span>Add Post</span>
                    </button>
                    <div className="border-mountain-200 flex items-center border-l-1 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() =>
                            handleNavigateToPost(navigationData.prevPostId)
                          }
                          disabled={!navigationData.prevPostId}
                          className="border-mountain-200 flex items-center rounded-lg border bg-white p-2 text-gray-700 normal-case disabled:opacity-50"
                        >
                          <ChevronLeft className="size-4" />
                          <span>Prev</span>
                        </Button>
                        {navigationData.currentPostIndex !== -1 && (
                          <div className="border-mountain-200 flex items-center rounded-lg border bg-white p-2 text-sm text-gray-500 select-none">
                            <span>{`Post ${navigationData.currentPostIndex + 1} of ${postList.length}`}</span>
                          </div>
                        )}
                        <Button
                          onClick={() =>
                            handleNavigateToPost(navigationData.nextPostId)
                          }
                          disabled={!navigationData.nextPostId}
                          className="border-mountain-200 flex items-center rounded-lg border bg-white p-2 text-gray-700 normal-case disabled:opacity-50"
                        >
                          <span>Next</span>
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
                  <div className="flex items-center space-x-2 rounded-lg border border-yellow-200 bg-yellow-100 p-2 px-4 text-yellow-800">
                    <ShieldAlert className="size-5" />
                    <span>This project is active. Editing is disabled.</span>
                  </div>
                )}
              </div>
            </div>
            <Box className="flex h-screen min-h-0 w-full">
              <Box className="border-mountain-200 custom-scrollbar flex min-h-0 w-lg flex-col space-y-8 overflow-x-hidden overflow-y-auto border-r-1 px-2">
                <Box className="flex flex-col space-y-4">
                  <Typography className="border-mountain-200 flex items-center space-x-2 border-b-1 py-2 text-indigo-900">
                    <span className="mr-2">🖊️</span>Post Content
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
              <FacebookPostPreview
                content={values.content}
                images={values.images.map((img) => img.url)}
                scheduledAt={values.scheduledAt}
                platform={matchedPlatform!}
              />
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
