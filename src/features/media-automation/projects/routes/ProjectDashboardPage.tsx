import Loading from '@/components/loading/Loading';
import { Button, Container, Typography } from '@mui/material';
import { PauseIcon, PlayIcon } from 'lucide-react';
import { BiEdit } from 'react-icons/bi';
import { useNavigate, useParams } from 'react-router-dom';
import { AutoPostsTable } from '../../auto-posts';
import { useGetProjectDetails } from '../hooks/useGetProjectDetails';
import { useUpdateProjectStatus } from '../hooks/useUpdateProjectStatus';
import { getStatusChipProps } from '../utils';

const ProjectDashboardPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { data: projectDetails, isLoading } = useGetProjectDetails(projectId);
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateProjectStatus();

  const handleToggleStatus = () => {
    if (!projectDetails) return;

    const newStatus =
      projectDetails.status.toUpperCase() === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

    updateStatus({
      projectId: projectDetails.id,
      newStatus,
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

  const isPaused = projectDetails.status.toUpperCase() === 'PAUSED';

  return (
    <div className="flex flex-col items-center w-full p-4 space-y-6 text-sm">
      <div className="relative flex items-end w-full gap-6 pb-4 border-b border-mountain-200">
        <div className="flex flex-col space-y-1 w-96">
          <p className="text-sm text-muted-foreground">Automation Project</p>
          <p className="py-1 pl-2 text-lg font-medium bg-indigo-200 rounded-lg line-clamp-1 h-9">
            {projectDetails.title}
          </p>
        </div>
        <div className="flex flex-col space-y-1 w-52">
          <p className="text-sm text-muted-foreground">Platform</p>
          <p className="py-1 pl-2 text-lg font-medium border-white rounded-lg line-clamp-1 h-9 border-1 bg-amber-200">
            {projectDetails?.platform?.name}
          </p>
        </div>
        <div className="flex flex-col space-y-1">
          <p className="text-sm text-muted-foreground">Status</p>
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
        <div className="flex items-center ml-auto space-x-2">
          <Button
            className="flex px-4 py-2 font-normal bg-white border-mountain-200 border-1"
            onClick={() => navigate(`/auto/projects/${projectId}/edit`)}
          >
            <BiEdit className="mr-2 size-6" />
            <span>Edit Project</span>
          </Button>
          <Button
            className="flex px-4 py-2 font-normal bg-white border-mountain-200 border-1"
            onClick={handleToggleStatus}
            disabled={isUpdatingStatus}
          >
            {isPaused ? (
              <PlayIcon className="mr-2 text-green-600 size-6" />
            ) : (
              <PauseIcon className="mr-2 text-yellow-600 size-6" />
            )}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </Button>
        </div>
      </div>
      <AutoPostsTable />
    </div>
  );
};

export default ProjectDashboardPage;
