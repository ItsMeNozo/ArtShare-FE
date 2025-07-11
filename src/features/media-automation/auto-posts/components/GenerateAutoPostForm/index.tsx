import InlineErrorMessage from '@/components/InlineErrorMessage';
import { Box, Button, TextField } from '@mui/material';
import {
  ErrorMessage,
  Field,
  Form,
  Formik,
  FormikHelpers,
  FormikProps,
} from 'formik';
import { TbFileTextSpark } from 'react-icons/tb';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { useGenAutoPosts } from '../../hooks/useGenAutoPosts';
import { GenAutoPostFormValues } from '../../types';
import SettingsPopover from './SettingsPopover';

const GenerateAutoPostForm = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

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

  return (
    <Box className="border-mountain-200 flex h-full flex-1 flex-col items-center border-b-1 bg-white pb-2">
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
            <Form className="border-mountain-200 flex h-20 w-full items-center gap-4 rounded-tr-3xl border-b bg-white pl-4">
              <Box className="flex flex-col">
                <Field
                  name="contentPrompt"
                  as={TextField}
                  className="placeholder:text-mountain-400 h-10 w-108 rounded-md"
                  placeholder="Generate your post content"
                />
                <ErrorMessage name="contentPrompt">
                  {(errorMsg) => <InlineErrorMessage errorMsg={errorMsg} />}
                </ErrorMessage>
              </Box>
              <Box className="flex h-10">
                <Field
                  name="postCount"
                  type="number"
                  min={1}
                  max={7}
                  className="h-10 w-16 rounded-md border border-gray-300 bg-white px-2"
                  placeholder="e.g. 5"
                />
              </Box>
              <SettingsPopover />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex h-10 w-30 shrink-0 items-center justify-center rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md transition"
              >
                {isSubmitting ? 'Writing...' : 'Start Writing'}
              </Button>
            </Form>
          );
        }}
      </Formik>
      <div className="ml-4 flex flex-1 flex-col items-center justify-center gap-4">
        <TbFileTextSpark className="text-mountain-400 size-12" />
        <p className="text-mountain-400 text-sm">
          Prompt for your post content to automate posting workflow
        </p>
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
