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
import { HiArrowLeft } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useGenAutoPosts } from '../../hooks/useGenAutoPosts';
import { GenAutoPostFormValues } from '../../types';
import SettingsPopover from './SettingsPopover';
import { PiStarFourFill } from 'react-icons/pi';
import { Book } from 'lucide-react';
import { GuidePanel } from '@/components/sheets/SheetGuidance';
import { useState } from 'react';

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
    <Box className="flex flex-col items-center bg-[#F2F4F7] border-mountain-200 rounded-t-3xl h-full">
      <div className="flex items-center bg-white px-4 py-2 border-mountain-200 border-b-1 rounded-t-3xl w-full h-16 shrink-0">
        <div className="flex justify-between items-center w-full">
          <div className="flex space-x-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleReturnToPosts}
                className="flex items-center space-x-2 bg-white hover:bg-mountain-50 p-2 border border-mountain-200 rounded-lg cursor-pointer"
              >
                <HiArrowLeft className="size-4" />
                <span>Return To Project</span>
              </button>
            </div>
          </div>
          <Button
            onClick={onGuideClick}
            className="flex justify-center items-center bg-white hover:bg-mountain-50 border border-mountain-200 rounded-lg w-24 h-10 font-medium text-mountain-950 text-sm cursor-pointer">
            <Book className="mr-2 size-6" />
            Guide
          </Button>
        </div>
      </div>
      <div className="flex justify-center items-center w-full h-full">
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
              <Form className="flex justify-between items-start gap-6 bg-white shadow-md p-4 rounded-lg w-3xl h-114">
                <SettingsPopover />
                <div className="flex flex-col flex-1 justify-between w-full h-full">
                  <div className="flex items-center space-x-2">
                    <PiStarFourFill className="text-purple-600" />
                    <p className="font-medium text-lg">Generate Content</p>
                  </div>
                  <Field
                    name="contentPrompt"
                    as="textarea"
                    rows={8}
                    className={`placeholder:text-mountain-400 min-h-80 w-full resize-none rounded-md border px-4 py-2 outline-0 ${errors.contentPrompt && touched.contentPrompt
                      ? 'border-red-500'
                      : 'border-gray-300'
                      }`}
                    placeholder="e.g., Create a fun and engaging post about the benefits of a morning coffee."
                  />
                  <div className="flex justify-end items-center space-x-4 w-full">
                    <div className="flex flex-1 p-2 border border-mountain-200 rounded-lg text-sm">
                      <span>Post Number: </span>
                      <Field name="postCount">
                        {({ field, form }: import('formik').FieldProps) => (
                          <input
                            {...field}
                            type="number"
                            min={1}
                            max={7}
                            className="bg-white rounded-md outline-0 w-fit text-center"
                            placeholder="e.g. 3"
                            onChange={(e) => {
                              let value = Number(e.target.value);
                              if (value < 1) value = 1;
                              if (value > 7) value = 7;
                              form.setFieldValue('postCount', value);
                            }}
                          />
                        )}
                      </Field>{' '}
                      <ErrorMessage name="postCount">
                        {(msg) => (
                          <div className="ml-2 text-red-600 text-sm">{msg}</div>
                        )}
                      </ErrorMessage>
                    </div>
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting || values.contentPrompt.trim() === ''
                      }
                      className="bg-gradient-to-r from-indigo-600 hover:from-indigo-700 to-purple-600 hover:to-purple-700 disabled:opacity-50 shadow px-4 py-2 rounded-md w-1/2 font-medium text-white"
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
      <GuidePanel open={showGuidePanel} onOpenChange={setShowGuidePanel} docName='content-automation' />
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
