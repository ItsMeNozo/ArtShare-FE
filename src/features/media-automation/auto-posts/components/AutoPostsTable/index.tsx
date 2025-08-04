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
    <div className="flex w-full flex-col space-y-2">
      <div className="flex w-full">
        <p>Number Of Posts: {totalPosts}</p>
      </div>
      <div className="border-mountain-200 flex h-full w-full overflow-hidden rounded-3xl border bg-white">
        <TableContainer className="h-[calc(100vh-14rem)] flex-col justify-between overflow-hidden">
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
                    className="hover:bg-mountain-50 border-mountain-100 h-12 border-b-2 last:border-b-0"
                    onClick={() => handleRowClick(row.id)}
                  >
                    <TableCell component="th" scope="row" align="right">
                      {row.id}
                    </TableCell>
                    <TableCell align="left" padding="none">
                      <p className="line-clamp-1 w-96">{row.content}</p>
                    </TableCell>
                    <TableCell align="right">
                      {row.imageUrls?.length || 0}
                    </TableCell>
                    <TableCell align="right">
                      <span className="flex items-center justify-end gap-2 text-sm">
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
                            <Button className="border-mountain-200 border-1 bg-indigo-50 py-2 font-normal">
                              <AiFillEdit className="size-5 text-indigo-600" />
                            </Button>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <Button
                              className="border-mountain-200 border-1 bg-red-50 py-2 font-normal"
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
                <TableRow sx={{ cursor: 'pointer' }} className="h-12 w-full">
                  <TableCell colSpan={7} align="center">
                    <Button
                      onClick={handleAddPostClick}
                      variant="outlined"
                      color="primary"
                      className="border-mountain-200 text-mountain-950 w-48 bg-white"
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
