import Loading from '@/components/loading/Loading';
import { useGetProjectDetails } from '@/features/media-automation/projects/hooks/useGetProjectDetails';
import { getStatusChipProps } from '@/features/media-automation/auto-posts/utils';
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
import { useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { IoTrashBin } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import {
  Order,
  SortableKeysItemTable,
} from '../../../projects/types/automation-project';
import { useGetAutoPosts } from '../../hooks/useGetAutoPosts';
import PostsTableHeader from './AutoPostsTableHeader';

const AutoPostsTable = () => {
  const projectId = useNumericParam('projectId');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<SortableKeysItemTable>('content');
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [page] = useState(1);
  const [rowsPerPage] = useState(7);
  const navigate = useNavigate();

  const { data: projectDetails } = useGetProjectDetails(projectId);
  const { data: fetchedPostsResponse, isLoading } = useGetAutoPosts({
    projectId: projectId,
    orderBy,
    order,
    page,
    limit: rowsPerPage,
  });

  const posts = fetchedPostsResponse?.data ?? [];

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

  if (isLoading || !projectDetails) {
    return <Loading />;
  }

  return (
    <div className="flex w-full flex-col space-y-2">
      <div className="flex w-full">
        <p>Number Of Posts: {posts.length}</p>
      </div>
      <div className="border-mountain-200 flex h-full w-full overflow-hidden rounded-3xl border bg-white">
        <TableContainer className="h-[calc(100vh-14rem)] flex-col justify-between overflow-hidden">
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
                    className="hover:bg-mountain-50 border-mountain-100 h-12 border-b-2 last:border-b-0"
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
                      <Tooltip title="Edit">
                        <Button className="border-mountain-200 border-1 bg-indigo-50 py-2 font-normal">
                          <AiFillEdit className="size-5 text-indigo-600" />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <Button className="border-mountain-200 border-1 bg-red-50 py-2 font-normal">
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
                  className="hover:bg-mountain-50 border-mountain-100 h-12 w-full border-b-2 last:border-b-0"
                  onClick={() => console.log('Add post clicked')}
                >
                  <TableCell colSpan={8} align="center">
                    <Button
                      onClick={() => handleAddPostClick()}
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
    </div>
  );
};

export default AutoPostsTable;
