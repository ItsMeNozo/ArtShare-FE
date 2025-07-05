import ConfirmationDialog from '@/components/ConfirmationDialog';
import InlineErrorMessage from '@/components/InlineErrorMessage';
import Loading from '@/components/loading/Loading';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';
import { useNumericParam } from '@/hooks/useNumericParam';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import { ErrorMessage, Form, Formik, FormikHelpers } from 'formik';
import { Image } from 'lucide-react';
import { useMemo, useState } from 'react';
import { LuCalendarClock, LuScanEye, LuTrash2 } from 'react-icons/lu';
import * as Yup from 'yup';
import { MAX_IMAGE_COUNT } from '../../constants';
import { useDeleteAutoPost } from '../../hooks/useDeleteAutoPost';
import { useEditAutoPost } from '../../hooks/useEditAutoPost';
import { useGetAutoPostDetails } from '../../hooks/useGetAutoPostDetails';
import { AutoPostFormValues, ImageState } from '../../types';
import PostContentEditor from './PostContentEditor';
import PostImagesEditor from './PostImagesEditor';
import PostScheduleEditor from './PostScheduleEditor';
import { FacebookPostDialog } from './PostPreviewer';

// import { Link, Element } from "react-scroll";

const EditAutoPostForm = () => {
  const postId = useNumericParam('postId');
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const { data: postToEdit, isLoading } = useGetAutoPostDetails(postId);
  const initialValues = useMemo((): AutoPostFormValues => {
    if (postToEdit) {
      const initialImages: ImageState[] = postToEdit.image_urls.map((url) => ({
        id: url,
        status: 'existing',
        url: url,
      }));

      return {
        content: postToEdit.content,
        images: initialImages,
        scheduled_at: postToEdit.scheduled_at,
      };
    }
    return { content: '', images: [], scheduled_at: new Date() };
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

  const handlePreviewClick = () => {
    setOpenPreviewDialog(true);
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
      {({ values, setFieldValue, errors, touched }) => {
        return (
          <Form className="flex flex-col bg-mountain-50 w-full h-[calc(100vh-4rem)]">
            <div className="flex items-center bg-white px-4 border-mountain-200 border-b-1 w-full h-20">
              <div className="flex justify-between items-center w-full">
                <div className="flex space-x-4">
                  <div className="flex py-2">
                    <p className="font-medium text-lg">Post {postId}</p>
                  </div>
                  <div className="flex bg-mountain-200 w-0.5 h-12" />
                  <div onClick={handlePreviewClick} className="flex items-center space-x-2 hover:bg-mountain-50/60 p-2 border border-mountain-200 rounded-lg cursor-pointer">
                    <LuScanEye />
                    <div>Preview</div>
                  </div>
                  <div className="flex items-center space-x-2 hover:bg-mountain-50/60 p-2 border border-mountain-200 rounded-lg cursor-pointer">
                    <Image className="size-4" />
                    <div>Images: {values.images.length}</div>
                  </div>
                  <Tooltip
                    title="This post is scheduled"
                    arrow
                    placement="bottom"
                  >
                    <div className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-100/60 px-4 py-2 rounded-full w-fit font-medium text-blue-800 cursor-pointer">
                      <LuCalendarClock className="size-4 shrink-0" />
                      <div className="flex bg-blue-800 w-0.5 h-8" />
                      <p>12/06/2025</p>
                      <p>21:00</p>
                    </div>
                  </Tooltip>
                </div>
                <div className="flex space-x-2">
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
            <Box className="flex flex-col flex-1 space-y-8 ml-4 min-h-0 overflow-y-auto sidebar">
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
                  value={values.scheduled_at}
                  onChange={(date) => setFieldValue('scheduled_at', date)}
                />
                <ErrorMessage name="scheduled_at">
                  {(msg) => <InlineErrorMessage errorMsg={msg} />}
                </ErrorMessage>
              </Box>
            </Box>
            <ConfirmationDialog
              open={isDialogOpen}
              onClose={closeDialog}
              onConfirm={handleConfirmDelete}
              title="Confirm Deletion"
              contentText="Are you sure you want to permanently delete this post? This action cannot be undone."
              confirmButtonText="Delete Post"
              isConfirming={isDeleting}
            />
            <FacebookPostDialog
              open={openPreviewDialog}
              onClose={() => setOpenPreviewDialog(false)}
              content={values.content}
              images={values.images.map((img) => img.url)}
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
  scheduled_at: Yup.date().optional().nullable(),
});
