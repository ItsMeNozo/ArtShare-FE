import api from '@/api/baseApi';
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
      await queryClient.invalidateQueries({ queryKey: ['auto-projects'] });
      setSelected([]);
    },
    onError: (err) => {
      console.error('Failed to delete project(s).', err);
    },
  });

  const handleDeleteProjects = (projectIds: readonly number[]) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${projectIds.length} project(s)?`,
      )
    ) {
      return;
    }
    deleteProjects(projectIds);
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
    <div className="flex flex-col w-full h-screen p-4 space-y-4">
      <div className="flex w-full gap-x-12">
        <div
          onClick={navigateToCreateProject}
          className="flex items-center justify-center w-1/3 p-4 space-x-2 shadow-md cursor-pointer bg-mountain-50 hover:bg-mountain-50/80 rounded-3xl h-28"
        >
          <MdOutlineAddBox className="size-8" />
          <p className="text-lg font-medium">Create New Project</p>
        </div>
        <div className="flex items-center justify-center w-2/3 space-x-2 h-28">
          <div className="flex items-center justify-between w-1/3 h-full p-4 bg-teal-100 rounded-3xl">
            <div className="flex flex-col space-y-1">
              <p className="text-xs text-mountain-800">Active Projects</p>
              <p className="text-2xl font-medium capitalize">
                {summaryStats.active} projects
              </p>
            </div>
            <FaCalendarCheck className="text-teal-600 size-10" />
          </div>
          <div className="flex items-center justify-between w-1/3 h-full p-4 bg-amber-100 rounded-3xl">
            <div className="flex flex-col space-y-1">
              <p className="text-xs text-mountain-800">Completed</p>
              <p className="text-2xl font-medium capitalize">
                {summaryStats.completed} projects
              </p>
            </div>
            <FaCalendarDays className="size-10 text-amber-600" />
          </div>
          <div className="flex items-center justify-between w-1/3 h-full p-4 bg-rose-100 rounded-3xl">
            <div className="flex flex-col space-y-1">
              <p className="text-xs text-mountain-800">Cancelled / Failed</p>
              <p className="text-2xl font-medium capitalize">
                {summaryStats.cancelledOrFailed} project
              </p>
            </div>
            <FaCalendarTimes className="size-10 text-rose-600" />
          </div>
        </div>
      </div>

      {combinedError && (
        <div className="p-3 text-red-500 bg-red-100 rounded-md">
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
        onDelete={handleDeleteProjects}
        selected={selected}
        setSelected={setSelected}
      />
    </div>
  );
};

export default ProjectsPage;
