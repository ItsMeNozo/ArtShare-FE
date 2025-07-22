import { Box, Button } from '@mui/material';
import {
  Field,
  Form,
  Formik,
  FormikHelpers,
  FormikProps,
} from 'formik';
import { TbGridDots } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useGenAutoPosts } from '../../hooks/useGenAutoPosts';
import { GenAutoPostFormValues } from '../../types';
import SettingsPopover from './SettingsPopover';
import { LuTrash2 } from 'react-icons/lu';
import { PiStarFourFill } from 'react-icons/pi';
import { useNumericParam } from '@/hooks/useNumericParam';
import { HiArrowLeft } from 'react-icons/hi2';
import { useGetAutoPosts } from '../../hooks/useGetAutoPosts';

const GenerateAutoPostForm = () => {
  const navigate = useNavigate();
  const projectId = useNumericParam('projectId');

  const { mutate: generateAutoPosts } = useGenAutoPosts({
    onSuccess: (data) => {
      navigate(`/auto/projects/${projectId}/posts/${data[0].id}/edit`);
    },
    onError: (error) => {
      console.error('Error generating posts:', error);
    },
  });

  const handleSubmit = (
    values: GenAutoPostFormValues,
    formikActions: FormikHelpers<GenAutoPostFormValues>,
  ) => {
    generateAutoPosts(
      {
        autoProjectId: Number(projectId),
        ...values,
      },
      {
        onSettled: () => {
          formikActions.setSubmitting(false);
        },
      },
    );
  };

  const handlePostItemClick = (postId: number) => {
    navigate(`/auto/projects/${projectId}/posts/${postId}/edit`);
  };

  const { data: fetchedPostsResponse } = useGetAutoPosts({
    projectId: projectId,
    orderBy: undefined,
    order: undefined,
    page: 1,
    limit: 10,
  });

  const postList = fetchedPostsResponse?.data ?? [];

  return (
    <Box className="flex flex-col items-center bg-[#F2F4F7] border-mountain-200 rounded-t-3xl h-full">
      <div className="flex items-center bg-white px-4 py-2 border-mountain-200 border-b-1 rounded-t-3xl w-full h-16 shrink-0">
        <div className="flex justify-between items-center w-full">
          <div className='flex space-x-4'>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2 bg-indigo-100 p-2 px-4 border border-mountain-200 rounded-full cursor-pointer'>
                <span>Project Posts</span>
                <TbGridDots />
              </div>
              <button type='button' disabled className='flex items-center space-x-2 hover:bg-mountain-50 p-2 border border-mountain-200 rounded-lg cursor-pointer'>
                <PiStarFourFill className='size-4 text-purple-600' />
                <span>Generate Post</span>
              </button>
              <div className='flex items-center px-4 border-mountain-200 border-l-1'>
                <button
                  disabled={!postList[0]?.id}
                  onClick={() => handlePostItemClick(postList[0]?.id)}
                  className='flex items-center space-x-2 bg-white hover:bg-mountain-50 p-2 border border-mountain-200 rounded-lg cursor-pointer'>
                  <HiArrowLeft className='size-4' />
                  <span>Return To Posts</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              type="submit"
              variant="contained"
              className='opacity-50 pointer-events-none'
            >
              Save Changes
            </Button>
            <Button
              type="button"
              onClick={() => { }}
              disabled
              className="flex items-center space-x-2 bg-mountain-100 hover:bg-mountain-50 disabled:opacity-50 p-2 border border-mountain-200 rounded-lg font-normal"
            >
              <LuTrash2 className="size-4" />
              <div>Delete</div>
            </Button>
          </div>
        </div>
      </div>
      <div className='flex justify-center items-center w-full h-full'>
        <Formik
          initialValues={{
            contentPrompt: '',
            postCount: 1,
            toneOfVoice: 'Friendly',
            wordCount: 100,
            generateHashtag: false,
            includeEmojis: false,
          }}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          {(formikProps: FormikProps<GenAutoPostFormValues>) => {
            const { isSubmitting } = formikProps;
            return (
              <Form className="flex justify-between items-start gap-6 bg-white shadow-md p-4 rounded-lg w-3xl h-fit">
                <SettingsPopover />
                <div className="flex flex-col flex-1 justify-between space-y-4 w-full h-full">
                  <div className='flex items-center space-x-2'>
                    <PiStarFourFill className='text-purple-600' />
                    <p className='font-medium text-lg'>Generate Post Content</p>
                  </div>
                  <Field
                    name="contentPrompt"
                    as="textarea"
                    rows={8}
                    className="px-4 py-2 border border-gray-300 rounded-md outline-0 w-full min-h-[200px] placeholder:text-mountain-400 resize-none"
                    placeholder="Create the compaign marketing content..."
                  />
                  <div className="flex justify-end items-center space-x-4 w-full">
                    <div className='flex flex-1 p-2 border border-mountain-200 rounded-lg'>
                      <span>Post Number: </span>
                      <Field
                        name="postCount"
                        type="number"
                        min={1}
                        max={7}
                        className="bg-white rounded-md outline-0 w-fit text-center"
                        placeholder="e.g. 3"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting || formikProps.values.contentPrompt === ''}
                      className="bg-gradient-to-r from-indigo-600 hover:from-indigo-700 to-purple-600 hover:to-purple-700 disabled:opacity-50 shadow px-4 py-2 rounded-md w-1/2 font-medium text-white"
                    >
                      {isSubmitting ? 'Writing...' : 'Start Writing'}
                    </Button>
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </Box>
  );
};

export default GenerateAutoPostForm;

const validationSchema = Yup.object().shape({
  contentPrompt: Yup.string()
    .required('Content prompt is required')
    .min(10, 'Content prompt must be at least 10 characters'),
  postCount: Yup.number()
    .required('Number of posts is required')
    .min(1, 'Must generate at least 1 post')
    .max(7, 'Cannot generate more than 7 posts'),
  toneOfVoice: Yup.string().optional(),
  wordCount: Yup.number()
    .optional()
    .min(100, 'Must be at least 100 words')
    .max(500, 'Cannot exceed 500 words'),
  generateHashtag: Yup.boolean().optional(),
  includeEmojis: Yup.boolean().optional(),
});
