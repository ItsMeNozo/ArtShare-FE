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
    <Box className="p-3 flex-1">
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? 'Edit Project' : 'Create a New Project'}
      </Typography>

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
            <Form className="flex flex-col items-center w-full h-full p-2 bg-white">
              <div className="flex gap-6">
                {/* General Info Section */}
                <div className="flex flex-col space-y-4">
                  <h2 className="text-lg font-semibold capitalize">
                    🧠 General Info
                  </h2>
                  <div className="flex flex-col items-center space-y-4 w-xl">
                    <Box className="w-full">
                      <Typography className="flex w-full mb-1 gap-1 font-medium text-left">
                        Project Name
                        <span className="text-red-600">*</span>
                      </Typography>
                      <Field
                        name="projectName" // Connects to Formik state
                        as={TextField}
                        className="w-full rounded-md focus:outline-none focus:ring-2 focus:ring-mountain-500"
                        placeholder="Enter your project name"
                      />
                      <ErrorMessage name="projectName">
                        {(errorMsg) => (
                          <InlineErrorMessage errorMsg={errorMsg} />
                        )}
                      </ErrorMessage>
                    </Box>
                    <Box className="w-full">
                      <Typography className="flex w-full mb-1 gap-1 font-medium text-left">
                        Description
                        <span className="text-red-600">*</span>
                      </Typography>
                      <Field
                        name="description"
                        as={TextField}
                        multiline
                        rows={4}
                        className="w-full rounded-md focus:outline-none focus:ring-2 focus:ring-mountain-500 esize-none"
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

                <div className="flex bg-mountain-200 w-0.5 h-full" />

                <PlatformSelection />
              </div>
              <Button
                type="submit"
                startIcon={<FaSave />}
                disabled={!dirty || isSubmitting}
                className={`
                  hover:cursor-pointer
                  w-48 h-10
                text-white font-medium
                  bg-indigo-600
                  hover:bg-indigo-700
                  disabled:bg-gray-300 disabled:cursor-not-allowed
                `}
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
