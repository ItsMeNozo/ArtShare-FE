import ConfirmationDialog from '@/components/ConfirmationDialog';
import Loading from '@/components/loading/Loading';
import { getStatusChipProps } from '@/features/media-automation/auto-posts/utils';
import { useGetProjectDetails } from '@/features/media-automation/projects/hooks/useGetProjectDetails';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';
import { useNumericParam } from '@/hooks/useNumericParam';
import {
  Button,
  Checkbox,
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
import { useDeleteAutoPost } from '../../hooks/useDeleteAutoPost';
import { useGetAutoPosts } from '../../hooks/useGetAutoPosts';
import PostsTableHeader from './AutoPostsTableHeader';

const AutoPostsTable = () => {
  const {
    isDialogOpen: isDeleteDialogOpen,
    itemToConfirm: postToDelete,
    openDialog: openDeleteDialog,
    closeDialog: closeDeleteDialog,
  } = useConfirmationDialog<number>();
  const projectId = useNumericParam('projectId');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<SortableKeysItemTable>('content');
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [page] = useState(1);
  const [rowsPerPage] = useState(7);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: projectDetails } = useGetProjectDetails(projectId);
  const { data: fetchedPostsResponse, isLoading } = useGetAutoPosts({
    projectId: projectId,
    orderBy,
    order,
    page,
    limit: rowsPerPage,
  });

  const { mutate: deletePost, isPending: isDeleting } = useDeleteAutoPost({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['auto-posts'] });
      closeDeleteDialog();
    },
  });

  const posts = fetchedPostsResponse?.data ?? [];
  console.log("posts", posts);

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: SortableKeysItemTable,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = posts.map((n) => n.id);
      setSelected(newSelected!);
      return;
    }
    setSelected([]);
  };

  const handleClick = (_event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - posts.length) : 0;

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

  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex w-full">
        <p>Number Of Posts: {posts.length}</p>
      </div>
      <div className="flex bg-white border border-mountain-200 rounded-3xl w-full h-full overflow-hidden">
        <TableContainer className="flex-col justify-between h-[calc(100vh-14rem)] overflow-hidden">
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={'medium'}
          >
            <PostsTableHeader
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={posts.length}
            />
            <TableBody>
              {posts.map((row, index) => {
                const isItemSelected = selected.includes(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleRowClick(row.id)}
                    className="hover:bg-mountain-50 border-mountain-100 border-b-2 last:border-b-0 h-12"
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onClick={(event) => handleClick(event, row.id)}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      align="right"
                    >
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
                    </TableCell>
                  </TableRow>
                );
              })}
              {posts.length < 7 && (
                <TableRow
                  sx={{ cursor: 'pointer' }}
                  className="hover:bg-mountain-50 border-mountain-100 border-b-2 last:border-b-0 w-full h-12"
                  onClick={() => console.log('Add post clicked')}
                >
                  <TableCell colSpan={8} align="center">
                    <Button
                      onClick={() => handleAddPostClick()}
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
