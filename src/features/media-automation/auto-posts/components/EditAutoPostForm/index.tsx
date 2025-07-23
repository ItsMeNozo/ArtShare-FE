import ConfirmationDialog from '@/components/dialogs/Confirm';
import InlineErrorMessage from '@/components/InlineErrorMessage';
import Loading from '@/components/loading/Loading';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';
import { useNumericParam } from '@/hooks/useNumericParam';
import { Box, Button, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { ErrorMessage, Form, Formik, FormikHelpers } from 'formik';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { LuTrash2 } from 'react-icons/lu';
import { PiStarFourFill } from 'react-icons/pi';
import { TbGridDots } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { MAX_IMAGE_COUNT } from '../../constants';
import { useDeleteAutoPost } from '../../hooks/useDeleteAutoPost';
import { useEditAutoPost } from '../../hooks/useEditAutoPost';
import { useGetAutoPostDetails } from '../../hooks/useGetAutoPostDetails';
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

  const handleAddPost = () => {
    navigate(`/auto/projects/${projectId}/posts/new`);
  };

  const queryClient = useQueryClient();

  const { data: postToEdit, isLoading } = useGetAutoPostDetails(postId);
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

  if (!postToEdit) {
    return (
      <Box className="flex h-full items-center justify-center">
        <Typography variant="h6" className="text-gray-600">
          Post not found or has been deleted
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return <Loading />;
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
                    <div className="border-mountain-200 flex cursor-pointer items-center space-x-2 rounded-full border bg-indigo-100 p-2 px-4">
                      <span>Project Posts</span>
                      <TbGridDots />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPost}
                      className="hover:bg-mountain-50 border-mountain-200 flex cursor-pointer items-center space-x-2 rounded-lg border p-2"
                    >
                      <PiStarFourFill className="size-4 text-purple-600" />
                      <span>Generate Post</span>
                    </button>
                    <div className="border-mountain-200 flex items-center border-l-1 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="border-mountain-200 flex cursor-pointer items-center rounded-lg border bg-white p-2">
                          <ChevronLeft className="size-4" />
                          <span>Prev</span>
                        </div>
                        <div className="border-mountain-200 flex cursor-pointer items-center rounded-lg border bg-white p-2">
                          <span>Post Number 1</span>
                        </div>
                        <div className="border-mountain-200 flex cursor-pointer items-center rounded-lg border bg-white p-2">
                          <span>Next</span>
                          <ChevronRight className="size-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
                  />
                  <ErrorMessage name="scheduledAt">
                    {(msg) => <InlineErrorMessage errorMsg={msg} />}
                  </ErrorMessage>
                </Box>
              </Box>
              <FacebookPostPreview
                content={values.content}
                images={values.images.map((img) => img.url)}
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
