import Loading from '@/components/loading/Loading';
import { useGetProjectDetails } from '@/features/media-automation/projects/hooks/useGetProjectDetails';
import { getStatusChipProps } from '@/features/media-automation/projects/utils';
import { useNumericParam } from '@/hooks/useNumericParam';
import { formatDate, formatDateTime } from '@/utils/date.util';
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex w-full">
        <p>Number Of Posts: {posts.length}</p>
      </div>
      <div className="border-mountain-200 flex w-full rounded-3xl border">
        <div className="flex w-full flex-col justify-between">
          <div className="flex flex-col">
            <TableContainer className="sidebar h-full flex-col justify-between">
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
                        className="hover:bg-mountain-50 border-mountain-100 h-12 border-b-2 last:border-b-0"
                        onClick={() => handleRowClick(row.id)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            onClick={(event) => handleClick(event, row.id)}
                          />
                        </TableCell>
                        {/* <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          padding="none"
                          className="overflow-hidden overflow-ellipsis whitespace-nowrap"
                        >
                          {row.content}
                        </TableCell> */}
                        <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          padding="none"
                          align="right"
                        >
                          {row.id}
                        </TableCell>
                        <TableCell align="right">
                          {row.image_urls?.length || 0}
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
                          {formatDateTime(row.scheduled_at)}
                        </TableCell>
                        <TableCell align="right">
                          {formatDate(row.created_at)}
                        </TableCell>
                        <TableCell align="right" className="space-x-2">
                          {/* <Tooltip title="Edit">
                            <Button className="border-mountain-200 border-1 bg-indigo-50 p-0 font-normal">
                              Edit
                            </Button>
                          </Tooltip> */}
                          <Tooltip title="Delete">
                            <Button className="border-mountain-200 border-1 bg-red-50 p-0 font-normal">
                              Delete
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {posts.length < 7 && (
                    <TableRow
                      sx={{ cursor: 'pointer' }}
                      className="hover:bg-mountain-50 border-mountain-100 h-12 border-b-2 last:border-b-0"
                      onClick={() => console.log('Add post clicked')} // Replace with your add logic
                    >
                      <TableCell colSpan={7} align="center">
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
      </div>
    </div>
  );
};

export default AutoPostsTable;
