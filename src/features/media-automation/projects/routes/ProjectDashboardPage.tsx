import Loading from '@/components/loading/Loading';
import { Button, Container, Typography } from '@mui/material';
import { PauseIcon } from 'lucide-react';
import { BiEdit } from 'react-icons/bi';
import { useNavigate, useParams } from 'react-router-dom';
import { AutoPostsTable } from '../../auto-posts';
import { useGetProjectDetails } from '../hooks/useGetProjectDetails';
import { getStatusChipProps } from '../utils';

const ProjectDashboardPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { data: projectDetails, isLoading } = useGetProjectDetails(projectId);

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

  return (
    <div className="h-full flex flex-col items-center space-y-6 p-4 w-full text-sm">
      <div className="relative flex items-end gap-6 pb-4 border-mountain-200 border-b w-full">
        <div className="flex flex-col space-y-1 w-96">
          <p className="text-muted-foreground text-sm">Automation Project</p>
          <p className="bg-indigo-200 py-1 pl-2 rounded-lg h-9 font-medium text-lg line-clamp-1">
            {projectDetails.title}
          </p>
        </div>
        <div className="flex flex-col space-y-1 w-52">
          <p className="text-muted-foreground text-sm">Platform</p>
          <p className="bg-amber-200 py-1 pl-2 border-1 border-white rounded-lg h-9 font-medium text-lg line-clamp-1">
            {projectDetails.platform.name}
          </p>
        </div>
        <div className="flex flex-col space-y-1">
          <p className="text-muted-foreground text-sm">Status</p>
          <div className="flex items-center space-x-4 bg-mountain-50 px-2 py-1 border-[1px] border-mountain-200 rounded-lg h-9 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${getStatusChipProps(projectDetails.status)}`}
            />
            <span className="font-medium text-lg capitalize">
              {projectDetails.status}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-auto">
          <Button
            className="flex px-4 py-2 border-1 border-mountain-200 font-normal"
            onClick={() => navigate(`/auto/projects/${projectId}/edit`)}
          >
            <BiEdit className="mr-2 size-6" />
            <span>Edit Project</span>
          </Button>
          <Button className="flex px-4 py-2 border-1 border-mountain-200 font-normal">
            <PauseIcon className="mr-2 size-6" />
            <span>Pause</span>
          </Button>
        </div>
      </div>

      <AutoPostsTable />
    </div>
  );
};

export default ProjectDashboardPage;
