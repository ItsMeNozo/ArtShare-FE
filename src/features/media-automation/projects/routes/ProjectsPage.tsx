import api from '@/api/baseApi';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa';
import { FaCalendarDays } from 'react-icons/fa6';
import { MdOutlineAddBox } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import ProjectTable from '../components/ProjectTable';
import { useGetProjects } from '../hooks/useGetProjects';
import {
  Order,
  ProjectSummaryStats,
  SortableKeys,
} from '../types/automation-project';

const ProjectsPage = () => {
  const {
    isDialogOpen,
    itemToConfirm: projectsToDelete,
    openDialog: openDeleteDialog,
    closeDialog: closeDeleteDialog,
  } = useConfirmationDialog<readonly number[]>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<SortableKeys>('nextPostAt');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<readonly number[]>([]);

  const {
    data: fetchedProjectsResponse,
    isLoading: isFetchingProjects,
    error: fetchError,
  } = useGetProjects({ page: page + 1, rowsPerPage, orderBy, order });

  const projects = useMemo(
    () => fetchedProjectsResponse?.data ?? [],
    [fetchedProjectsResponse?.data],
  );

  const totalProjects = useMemo(
    () => fetchedProjectsResponse?.total ?? 0,
    [fetchedProjectsResponse?.total],
  );

  const {
    mutate: deleteProjects,
    isPending: isDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: (projectIds: readonly number[]) =>
      Promise.all(projectIds.map((id) => api.delete(`/auto-project/${id}`))),

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects', 'list'] });
      setSelected([]);
      closeDeleteDialog();
    },
    onError: (err) => {
      console.error('Failed to delete project(s).', err);
      closeDeleteDialog();
    },
  });

  const handleDeleteRequest = (projectIds: readonly number[]) => {
    if (projectIds.length > 0) {
      openDeleteDialog(projectIds);
    }
  };

  const handleConfirmDelete = () => {
    if (projectsToDelete) {
      deleteProjects(projectsToDelete);
    }
  };

  const summaryStats: ProjectSummaryStats = useMemo(() => {
    return projects.reduce(
      (acc, project) => {
        if (project.status === 'ACTIVE') acc.active++;
        if (project.status === 'COMPLETED') acc.completed++;
        if (project.status === 'CANCELLED' || project.status === 'FAILED')
          acc.cancelledOrFailed++;
        return acc;
      },
      { active: 0, completed: 0, cancelledOrFailed: 0 },
    );
  }, [projects]);

  const navigateToCreateProject = () => {
    navigate('/auto/projects/new');
  };

  const combinedError = fetchError || deleteError;

  return (
    <div className="flex flex-col space-y-4 p-4 w-full h-screen">
      <div className="flex gap-x-12 w-full">
        <div
          onClick={navigateToCreateProject}
          className="flex justify-center items-center space-x-2 bg-white hover:bg-mountain-50/80 shadow-md p-4 rounded-3xl w-1/3 h-28 cursor-pointer"
        >
          <MdOutlineAddBox className="size-8" />
          <p className="font-medium text-lg">Create New Project</p>
        </div>
        <div className="flex justify-center items-center space-x-2 w-2/3 h-28">
          <div className="flex justify-between items-center bg-teal-100 shadow-md p-4 rounded-3xl w-1/3 h-full">
            <div className="flex flex-col space-y-1">
              <p className="text-mountain-800 text-xs">Active Projects</p>
              <p className="font-medium text-2xl capitalize">
                {summaryStats.active} projects
              </p>
            </div>
            <FaCalendarCheck className="size-10 text-teal-600" />
          </div>
          <div className="flex justify-between items-center bg-amber-100 shadow-md p-4 rounded-3xl w-1/3 h-full">
            <div className="flex flex-col space-y-1">
              <p className="text-mountain-800 text-xs">Completed</p>
              <p className="font-medium text-2xl capitalize">
                {summaryStats.completed} projects
              </p>
            </div>
            <FaCalendarDays className="size-10 text-amber-600" />
          </div>
          <div className="flex justify-between items-center bg-rose-100 shadow-md p-4 rounded-3xl w-1/3 h-full">
            <div className="flex flex-col space-y-1">
              <p className="text-mountain-800 text-xs">Cancelled / Failed</p>
              <p className="font-medium text-2xl capitalize">
                {summaryStats.cancelledOrFailed} project
              </p>
            </div>
            <FaCalendarTimes className="size-10 text-rose-600" />
          </div>
        </div>
      </div>

      {combinedError && (
        <div className="bg-red-100 p-3 rounded-md text-red-500">
          {combinedError.message || 'An unexpected error occurred.'}
        </div>
      )}

      <ProjectTable
        projects={projects}
        totalProjects={totalProjects}
        isLoading={isFetchingProjects || isDeleting}
        order={order}
        setOrder={setOrder}
        orderBy={orderBy}
        setOrderBy={setOrderBy}
        page={page}
        setPage={setPage}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        onDelete={handleDeleteRequest}
        selected={selected}
        setSelected={setSelected}
      />

      <ConfirmationDialog
        open={isDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Project(s)"
        contentText={`Are you sure you want to delete ${projectsToDelete?.length === 1
            ? 'this project'
            : `${projectsToDelete?.length || 0} projects`
          }? This action cannot be undone.`}
        isConfirming={isDeleting}
        confirmButtonText="Delete"
      />
    </div>
  );
};

export default ProjectsPage;
