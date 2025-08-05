import ConfirmationDialog from '@/components/ConfirmationDialog';
import Loading from '@/components/loading/Loading';
import { getStatusChipProps } from '@/features/media-automation/auto-posts/utils';
import { useGetProjectDetails } from '@/features/media-automation/projects/hooks/useGetProjectDetails';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';
import { useNumericParam } from '@/hooks/useNumericParam';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { IoTrashBin } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import {
  Order,
  SortableKeysItemTable,
} from '../../../projects/types/automation-project';
import { MAX_POSTS_PER_PROJECT } from '../../constants';
import { useDeleteAutoPost } from '../../hooks/useDeleteAutoPost';
import { useGetAutoPosts } from '../../hooks/useGetAutoPosts';
import PostsTableHeader from './AutoPostsTableHeader';
import { BsQuestion } from 'react-icons/bs';

const AutoPostsTable = ({ canEdit }: { canEdit: boolean }) => {
  const {
    isDialogOpen: isDeleteDialogOpen,
    itemToConfirm: postToDelete,
    openDialog: openDeleteDialog,
    closeDialog: closeDeleteDialog,
  } = useConfirmationDialog<number>();
  const projectId = useNumericParam('projectId');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<SortableKeysItemTable>('content');

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: projectDetails } = useGetProjectDetails(projectId);
  const { data: fetchedPostsResponse, isLoading } = useGetAutoPosts({
    projectId: projectId,
    orderBy,
    order,
    limit: MAX_POSTS_PER_PROJECT,
  });

  const { mutate: deletePost, isPending: isDeleting } = useDeleteAutoPost({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['auto-posts'] });
      closeDeleteDialog();
    },
  });

  const posts = fetchedPostsResponse?.data ?? [];
  const totalPosts = fetchedPostsResponse?.total ?? posts.length;

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: SortableKeysItemTable,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleAddPostClick = () => {
    navigate(`/auto/projects/${projectDetails!.id}/posts/new`);
  };

  const handleRowClick = (postId: number) => {
    navigate(`/auto/projects/${projectDetails!.id}/posts/${postId}/edit`);
  };

  const handleDeleteClick = (postId: number) => {
    openDeleteDialog(postId);
  };

  const handleDeleteConfirm = () => {
    if (postToDelete) {
      deletePost(postToDelete);
    }
  };

  if (isLoading || !projectDetails) {
    return <Loading />;
  }

  const emptyRows = Math.max(0, MAX_POSTS_PER_PROJECT - posts.length);

  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex items-center w-full">
        <p className='mr-2 font-medium'>Number Of Posts: {totalPosts} / 7</p>
        <Tooltip title="The project allows a maximum of 7 posts." placement="top">
          <div className="flex justify-center items-center bg-white border border-mountain-200 rounded-full w-6 h-6 text-mountain-950">
            <BsQuestion className='size-5' />
          </div>
        </Tooltip>
      </div>
      <div className="flex bg-white border border-mountain-200 rounded-3xl w-full h-full overflow-hidden">
        <TableContainer className="flex-col justify-between h-[calc(100vh-14rem)] overflow-hidden">
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={'medium'}
          >
            <PostsTableHeader
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {posts.map((row) => {
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.id}
                    sx={{ cursor: 'pointer' }}
                    className="hover:bg-mountain-50 border-mountain-100 border-b-2 last:border-b-0 h-12"
                    onClick={() => handleRowClick(row.id)}
                  >
                    <TableCell component="th" scope="row" align="right">
                      {row.id}
                    </TableCell>
                    <TableCell align="left" padding="none">
                      <p className="w-96 line-clamp-1">{row.content}</p>
                    </TableCell>
                    <TableCell align="right">
                      {row.imageUrls?.length || 0}
                    </TableCell>
                    <TableCell align="right">
                      <span className="flex justify-end items-center gap-2 text-sm">
                        <span
                          className={`h-2 w-2 rounded-full${getStatusChipProps(row.status)}`}
                        ></span>
                        <span className="capitalize">{row.status}</span>
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      {row.scheduledAt
                        ? new Date(row.scheduledAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right" className="space-x-2">
                      {canEdit && (
                        <>
                          <Tooltip title="Edit">
                            <Button className="bg-indigo-50 py-2 border-1 border-mountain-200 font-normal">
                              <AiFillEdit className="size-5 text-indigo-600" />
                            </Button>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <Button
                              className="bg-red-50 py-2 border-1 border-mountain-200 font-normal"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(row.id);
                              }}
                            >
                              <IoTrashBin className="size-5 text-red-600" />
                            </Button>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {canEdit && posts.length < MAX_POSTS_PER_PROJECT && (
                <TableRow sx={{ cursor: 'pointer' }} className="w-full h-12">
                  <TableCell colSpan={7} align="center">
                    <Button
                      onClick={handleAddPostClick}
                      variant="outlined"
                      color="primary"
                      className="bg-white border-mountain-200 w-48 text-mountain-950"
                    >
                      + Add Post
                    </Button>
                  </TableCell>
                </TableRow>
              )}

              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 42 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Post"
        contentText="Are you sure you want to delete this post? This action cannot be undone."
        confirmButtonText="Delete"
        isConfirming={isDeleting}
      />
    </div>
  );
};

export default AutoPostsTable;
