import { GuidePanel } from '@/components/sheets/SheetGuidance';
import { useGetProjectDetails } from '@/features/media-automation/projects/hooks/useGetProjectDetails';
import { useNumericParam } from '@/hooks/useNumericParam';
import { Box, Button } from '@mui/material';
import {
  ErrorMessage,
  Field,
  Form,
  Formik,
  FormikHelpers,
  FormikProps,
} from 'formik';
import { Book } from 'lucide-react';
import { useState } from 'react';
import { HiArrowLeft } from 'react-icons/hi2';
import { PiStarFourFill } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useGenAutoPosts } from '../../hooks/useGenAutoPosts';
import { GenAutoPostFormValues } from '../../types';
import SettingsPopover from './SettingsPopover';

const GenerateAutoPostForm = () => {
  const navigate = useNavigate();
  const projectId = useNumericParam('projectId');
  const [showGuidePanel, setShowGuidePanel] = useState(false);
  const onGuideClick = () => {
    setShowGuidePanel((prev) => !prev);
  };
  const { mutate: generateAutoPosts } = useGenAutoPosts({
    onSuccess: (data) => {
      if (data && data.length > 0) {
        navigate(`/auto/projects/${projectId}/posts/${data[0].id}/edit`);
      }
    },
    onError: (error) => {
      console.error('Error generating posts:', error);
    },
  });

  const { data: projectDetails } = useGetProjectDetails(projectId);

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

  const handleReturnToPosts = () => {
    navigate(`/auto/projects/${projectId}/details`);
  };

  return (
    <Box className="border-mountain-200 flex h-full flex-col items-center rounded-t-3xl bg-[#F2F4F7]">
      <div className="border-mountain-200 flex h-16 w-full shrink-0 items-center rounded-t-3xl border-b-1 bg-white px-4 py-2">
        <div className="flex w-full items-center justify-between">
          <div className="flex space-x-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleReturnToPosts}
                className="hover:bg-mountain-50 border-mountain-200 flex cursor-pointer items-center space-x-2 rounded-lg border bg-white p-2"
              >
                <HiArrowLeft className="size-4" />
                <span>Return To Project</span>
              </button>
            </div>
          </div>
          <Button
            onClick={onGuideClick}
            className="hover:bg-mountain-50 border-mountain-200 text-mountain-950 flex h-10 w-24 cursor-pointer items-center justify-center rounded-lg border bg-white text-sm font-medium"
          >
            <Book className="mr-2 size-6" />
            Guide
          </Button>
        </div>
      </div>
      <div className="flex h-full w-full items-center justify-center">
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
            const { isSubmitting, values, errors, touched } = formikProps;
            return (
              <Form className="flex h-114 w-3xl items-start justify-between gap-6 rounded-lg bg-white p-4 shadow-md">
                <SettingsPopover />
                <div className="flex h-full w-full flex-1 flex-col justify-between">
                  <div className="flex items-center space-x-2">
                    <PiStarFourFill className="text-purple-600" />
                    <p className="text-lg font-medium">Generate Content</p>
                  </div>
                  <Field
                    name="contentPrompt"
                    as="textarea"
                    rows={8}
                    className={`placeholder:text-mountain-400 min-h-80 w-full resize-none rounded-md border px-4 py-2 outline-0 ${
                      errors.contentPrompt && touched.contentPrompt
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="e.g., Create a fun and engaging post about the benefits of a morning coffee."
                  />
                  <div className="flex w-full items-center justify-end space-x-4">
                    <div className="border-mountain-200 flex flex-1 rounded-lg border p-2 text-sm">
                      <span>Post Number: </span>
                      <Field name="postCount">
                        {({ field, form }: import('formik').FieldProps) => (
                          <input
                            {...field}
                            type="number"
                            min={1}
                            max={7}
                            className="w-fit rounded-md bg-white text-center outline-0"
                            placeholder="e.g. 3"
                            onChange={(e) => {
                              let value = Number(e.target.value);
                              if (value < 1) value = 1;
                              if (value > 7) value = 7;

                              const remainingPosts =
                                7 - projectDetails!.postCount;
                              if (value > remainingPosts) {
                                value = remainingPosts;
                              }
                              form.setFieldValue('postCount', value);
                            }}
                          />
                        )}
                      </Field>{' '}
                      <ErrorMessage name="postCount">
                        {(msg) => (
                          <div className="ml-2 text-sm text-red-600">{msg}</div>
                        )}
                      </ErrorMessage>
                    </div>
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting || values.contentPrompt.trim() === ''
                      }
                      className="w-1/2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 font-medium text-white shadow hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Writing...' : 'Start Writing'}
                    </Button>
                  </div>
                  {/* <ErrorMessage name="contentPrompt" >
                    {(msg) => <div className="text-red-600 text-sm text-right">*{msg}</div>}
                  </ErrorMessage> */}
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
      <GuidePanel
        open={showGuidePanel}
        onOpenChange={setShowGuidePanel}
        docName="content-automation"
      />
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
  url: Yup.string()
    .optional()
    .test(
      'is-valid-url',
      'Please enter a valid URL (e.g., https://example.com)',
      (value) => !value || /^(https|http):\/\/[^\s$.?#].[^\s]*$/.test(value),
    ),
});
