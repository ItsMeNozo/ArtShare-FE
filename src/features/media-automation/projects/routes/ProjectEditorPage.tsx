import Loading from '@/components/loading/Loading';
import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetProjectDetails } from '../hooks/useGetProjectDetails';
import { useSaveProject } from '../hooks/useSaveProject';
import { ProjectFormValues } from '../types';

import InlineErrorMessage from '@/components/InlineErrorMessage';
import { Button, FormHelperText, TextField } from '@mui/material';
import { ErrorMessage, Field, Form, Formik, FormikProps } from 'formik';
import { FaSave } from 'react-icons/fa';
import { MdErrorOutline } from 'react-icons/md';
import * as Yup from 'yup';
import PlatformSelection from '../components/PlatformSelection';

const ProjectEditorPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const isEditMode = !!projectId;

  const { data: projectToEdit, isLoading: isLoadingProject } =
    useGetProjectDetails(projectId, {
      enabled: isEditMode,
    });

  const { mutate: saveProject } = useSaveProject({
    onSuccess: (savedProject) => {
      navigate(`/auto/projects/${savedProject.id}/details`);
    },
  });

  const handleSubmitForm = async (values: ProjectFormValues) => {
    saveProject({
      values,
      id: isEditMode ? parseInt(projectId) : undefined,
    });
  };

  const initialValues = useMemo((): ProjectFormValues => {
    if (isEditMode && projectToEdit) {
      return {
        projectName: projectToEdit.title,
        description: projectToEdit.description,
        platform: projectToEdit.platform, // Assuming the shape matches
      };
    }
    return {
      projectName: '',
      description: '',
      platform: {
        id: -1,
        name: '',
      },
    };
  }, [isEditMode, projectToEdit]);

  if (isEditMode && !projectToEdit) {
    return <div>Project not found or an error occurred.</div>;
  }

  return (
    <Box className="relative flex h-full w-full items-center justify-center p-4">
      {isLoadingProject && <Loading />}
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmitForm}
        validationSchema={validationSchema}
        enableReinitialize
      >
        {(formikProps: FormikProps<ProjectFormValues>) => {
          const { dirty, isSubmitting } = formikProps;
          return (
            <Form className="flex h-full w-full flex-col items-center space-y-4">
              <div className="flex h-64 w-full justify-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-50 p-2">
                <PlatformSelection isEditMode={isEditMode} />
              </div>
              {/* General Info Section */}
              <div className="flex w-xl flex-col space-y-4">
                <div className="flex w-xl flex-col items-center space-y-4">
                  <Box className="w-full">
                    <Typography className="mb-1 flex w-full gap-1 text-left font-medium">
                      Project Name
                      <span className="text-red-600">*</span>
                    </Typography>
                    <Field
                      name="projectName" // Connects to Formik state
                      as={TextField}
                      className="focus:ring-mountain-500 w-full rounded-md focus:ring-2 focus:outline-none"
                      placeholder="Enter your project name"
                    />
                    <ErrorMessage name="projectName">
                      {(errorMsg) => <InlineErrorMessage errorMsg={errorMsg} />}
                    </ErrorMessage>
                  </Box>
                  <Box className="w-full">
                    <Typography className="mb-1 flex w-full gap-1 text-left font-medium">
                      Description
                      <span className="text-red-600">*</span>
                    </Typography>
                    <Field
                      name="description"
                      as={TextField}
                      multiline
                      rows={4}
                      className="focus:ring-mountain-500 esize-none w-full rounded-md focus:ring-2 focus:outline-none"
                      placeholder="Enter your project description"
                    />
                    <ErrorMessage name="description">
                      {(errorMsg) => (
                        <FormHelperText error className="flex items-start">
                          <MdErrorOutline
                            size="1.5em"
                            style={{
                              marginRight: '0.4em',
                            }}
                          />
                          {errorMsg}
                        </FormHelperText>
                      )}
                    </ErrorMessage>
                  </Box>
                </div>
              </div>
              <Button
                type="submit"
                startIcon={<FaSave />}
                disabled={!dirty || isSubmitting}
                className={`absolute bottom-4 h-10 w-48 bg-indigo-600 font-medium text-white hover:cursor-pointer hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300`}
              >
                {isSubmitting ? 'Saving...' : 'Save Project'}
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default ProjectEditorPage;

const validationSchema = Yup.object().shape({
  projectName: Yup.string()
    .min(5, 'Project name must be at least 5 characters')
    .required('Project name is required'),
  description: Yup.string()
    .min(5, 'Description must be at least 5 characters')
    .required('Description is required'),
  platform: Yup.object().shape({
    id: Yup.number()
      .min(1, 'Please select a platform account')
      .required('Platform is required'),
    name: Yup.string(),
  }),
});
