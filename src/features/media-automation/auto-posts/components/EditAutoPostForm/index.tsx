import ConfirmationDialog from '@/components/dialogs/Confirm';
import InlineErrorMessage from '@/components/InlineErrorMessage';
import Loading from '@/components/loading/Loading';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';
import { useNumericParam } from '@/hooks/useNumericParam';
import { Box, Button, Typography } from '@mui/material';
import { ErrorMessage, Form, Formik, FormikHelpers } from 'formik';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { LuTrash2 } from 'react-icons/lu';
import * as Yup from 'yup';
import { MAX_IMAGE_COUNT } from '../../constants';
import { useDeleteAutoPost } from '../../hooks/useDeleteAutoPost';
import { useEditAutoPost } from '../../hooks/useEditAutoPost';
import { useGetAutoPostDetails } from '../../hooks/useGetAutoPostDetails';
import { AutoPostFormValues, ImageState } from '../../types';
import PostContentEditor from './PostContentEditor';
import PostImagesEditor from './PostImagesEditor';
import PostScheduleEditor from './PostScheduleEditor';
import { FacebookPostPreview } from './PostPreviewer';
import { TbGridDots } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { PiStarFourFill } from 'react-icons/pi';

// import { Link, Element } from "react-scroll";

const EditAutoPostForm = () => {
  const postId = useNumericParam('postId');
  const navigate = useNavigate();
  const projectId = useNumericParam('projectId');

  const handleAddPost = () => {
    navigate(`/auto/projects/${projectId}/posts/new`);
  };

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
      <Box className="flex justify-center items-center h-full">
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
      enableReinitialize // This is crucial to update the form when `initialValues` change (after data fetching)
    >
      {({ values, setFieldValue, errors, touched, isSubmitting }) => {
        return (
          <Form className="flex flex-col bg-[#F2F4F7] rounded-t-3xl w-full h-[calc(100vh-4rem)]">
            <div className="flex items-center bg-white px-4 py-2 border-mountain-200 border-b-1 rounded-t-3xl w-full h-16 shrink-0">
              <div className="flex justify-between items-center w-full">
                <div className='flex space-x-4'>
                  <div className='flex items-center space-x-4'>
                    <div className='flex items-center space-x-2 bg-indigo-100 p-2 px-4 border border-mountain-200 rounded-full cursor-pointer'>
                      <span>Project Posts</span>
                      <TbGridDots />
                    </div>
                    <button type='button' onClick={handleAddPost} className='flex items-center space-x-2 hover:bg-mountain-50 p-2 border border-mountain-200 rounded-lg cursor-pointer'>
                      <PiStarFourFill className='size-4 text-purple-600' />
                      <span>Generate Post</span>
                    </button>
                    <div className='flex items-center px-4 border-mountain-200 border-l-1'>
                      <div className='flex items-center space-x-2'>
                        <div className='flex items-center bg-white p-2 border border-mountain-200 rounded-lg cursor-pointer'>
                          <ChevronLeft className='size-4' />
                          <span>Prev</span>
                        </div>
                        <div className='flex items-center bg-white p-2 border border-mountain-200 rounded-lg cursor-pointer'>
                          <span>Post Number 1</span>
                        </div>
                        <div className='flex items-center bg-white p-2 border border-mountain-200 rounded-lg cursor-pointer'>
                          <span>Next</span>
                          <ChevronRight className='size-4' />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => openDialog(postId!)}
                    className="flex items-center space-x-2 bg-mountain-100 hover:bg-mountain-50 p-2 border border-mountain-200 rounded-lg"
                  >
                    <LuTrash2 className="size-4" />
                    <div>Delete</div>
                  </Button>
                </div>
              </div>
            </div>
            <Box className='flex w-full h-screen min-h-0'>
              <Box className="flex flex-col space-y-8 px-2 border-mountain-200 border-r-1 w-lg min-h-0 overflow-x-hidden overflow-y-auto custom-scrollbar">
                <Box className="flex flex-col space-y-4">
                  <Typography className="flex items-center space-x-2 py-2 border-mountain-200 border-b-1 text-indigo-900">
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
                  <div className="flex items-center space-x-2 py-2 border-mountain-200 border-b-1 text-indigo-900">
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
                  <Typography className="flex items-center space-x-2 py-2 border-mountain-200 border-b font-medium text-indigo-900">
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
      (value) => !!value?.replace(/<[^>]+>/g, '').trim(), // Strip HTML tags for validation
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
