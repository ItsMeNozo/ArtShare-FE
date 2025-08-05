import Loading from '@/components/loading/Loading';
import { Button, Container, Tooltip, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { PauseIcon, PlayIcon, RocketIcon } from 'lucide-react';
import { BiEdit } from 'react-icons/bi';
import { useNavigate, useParams } from 'react-router-dom';
import { AutoPostsTable } from '../../auto-posts';
import { useGetProjectDetails } from '../hooks/useGetProjectDetails';
import { useStartProject } from '../hooks/useStartProject';
import { useUpdateProjectStatus } from '../hooks/useUpdateProjectStatus';
import { getStatusChipProps } from '../utils';

const ProjectDashboardPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { data: projectDetails, isLoading } = useGetProjectDetails(projectId);
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateProjectStatus();
  const { mutate: startProject, isPending: isStartingProject } =
    useStartProject();

  const handlePauseProject = () => {
    if (!projectDetails) return;
    updateStatus({
      projectId: projectDetails.id,
      newStatus: 'PAUSED',
    });
  };

  const handleStartProject = () => {
    if (!projectDetails) return;
    startProject({ projectId: projectDetails.id });
  };

  const handleResumeProject = () => {
    if (!projectDetails) return;
    updateStatus({
      projectId: projectDetails.id,
      newStatus: 'ACTIVE',
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!projectDetails) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error">Project not found.</Typography>
      </Container>
    );
  }

  const status = projectDetails.status.toUpperCase();
  const isDraft = status === 'DRAFT';
  const isPaused = status === 'PAUSED';
  const isActive = status === 'ACTIVE';
  const isCompletedWithErrors = status === 'COMPLETED_WITH_ERRORS';
  const isCompleted = status === 'COMPLETED';

  const canEditProject = !(
    status === 'ACTIVE' ||
    isCompleted ||
    isCompletedWithErrors
  );

  let editTooltipContent = '';
  if (isActive) {
    editTooltipContent =
      'Cannot edit a running project. Pause it first to make changes.';
  } else if (isCompleted) {
    editTooltipContent = 'This project is completed and cannot be edited.';
  }

  return (
    <div className="flex w-full flex-col items-center space-y-6 p-4 text-sm">
      <div className="border-mountain-200 relative flex w-full items-end gap-6 border-b pb-4">
        <div className="flex w-96 flex-col space-y-1">
          <p className="text-muted-foreground text-sm">Automation Project</p>
          <p className="line-clamp-1 h-9 rounded-lg bg-indigo-200 py-1 pl-2 text-lg font-medium">
            {projectDetails.title}
          </p>
        </div>
        <div className="flex w-52 flex-col space-y-1">
          <p className="text-muted-foreground text-sm">Platform</p>
          <p className="line-clamp-1 h-9 rounded-lg border-1 border-white bg-amber-200 py-1 pl-2 text-lg font-medium">
            {projectDetails?.platform?.name}
          </p>
        </div>
        <div className="flex flex-col space-y-1">
          <p className="text-muted-foreground text-sm">Status</p>
          <div className="border-mountain-200 flex h-9 items-center space-x-4 rounded-lg border-[1px] bg-white px-2 py-1 text-sm">
            <div
              className={`h-2 w-2 rounded-full ${getStatusChipProps(projectDetails.status)}`}
            />
            <span className="text-lg font-medium">
              {projectDetails.status.charAt(0).toUpperCase() +
                projectDetails.status.slice(1).toLowerCase()}
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <Tooltip title={editTooltipContent} arrow>
            <span>
              <Button
                className="border-mountain-200 flex border-1 bg-white px-4 py-2 font-normal"
                onClick={() => navigate(`/auto/projects/${projectId}/edit`)}
                disabled={
                  !canEditProject || isUpdatingStatus || isStartingProject
                }
                sx={{
                  '&.Mui-disabled': {
                    backgroundColor: grey[200],
                    color: grey[500],
                    borderColor: grey[300],
                  },
                }}
              >
                <BiEdit className="mr-2 size-6" />
                <span>Edit Project</span>
              </Button>
            </span>
          </Tooltip>

          {isDraft && (
            <Button
              className="flex border-1 border-green-200 bg-green-100 px-4 py-2 font-normal"
              onClick={handleStartProject}
              disabled={isStartingProject}
            >
              <RocketIcon className="mr-2 size-6 text-green-600" />
              <span>Start Project</span>
            </Button>
          )}

          {isActive && (
            <Button
              className="border-mountain-200 flex border-1 bg-white px-4 py-2 font-normal"
              onClick={handlePauseProject}
              disabled={isUpdatingStatus}
            >
              <PauseIcon className="mr-2 size-6 text-yellow-600" />
              <span>Pause</span>
            </Button>
          )}

          {isPaused && (
            <Button
              className="border-mountain-200 flex border-1 bg-white px-4 py-2 font-normal"
              onClick={handleResumeProject}
              disabled={isUpdatingStatus}
            >
              <PlayIcon className="mr-2 size-6 text-green-600" />
              <span>Resume</span>
            </Button>
          )}

          {isCompletedWithErrors && (
            <div className="w-full border-l-4 border-orange-500 bg-orange-100 p-3 text-orange-700">
              <p className="font-bold">Project Finished with Errors</p>
              <p>
                This project's schedule is complete, but one or more posts
                failed. Please review the posts below.
              </p>
            </div>
          )}
        </div>
      </div>
      <AutoPostsTable canEdit={canEditProject} />
    </div>
  );
};

export default ProjectDashboardPage;
