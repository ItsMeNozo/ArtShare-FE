import { Button, CircularProgress, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import { visuallyHidden } from '@mui/utils';
import { useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { IoTrashBin } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import {
  AutoProjectListItem,
  EnhancedTableProps,
  HeadCell,
  Order,
  SortableKeys,
} from '../types/automation-project';

const headCells: readonly HeadCell[] = [
  {
    id: 'title',
    numeric: false,
    disablePadding: true,
    label: 'Project Name',
    isSortable: true,
  },
  {
    id: 'platform',
    numeric: true,
    disablePadding: false,
    label: 'Platform',
    isSortable: false,
  },
  {
    id: 'postCount',
    numeric: true,
    disablePadding: false,
    label: 'Post Number',
    isSortable: true,
  },
  {
    id: 'status',
    numeric: true,
    disablePadding: false,
    label: 'Status',
    isSortable: true,
  },
  {
    id: 'nextPostAt',
    numeric: true,
    disablePadding: false,
    label: 'Next Post Time',
    isSortable: true,
  },
];

function ProjectTableHead(props: EnhancedTableProps) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler =
    (property: SortableKeys) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow className="border-mountain-100 border-b-2">
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            className="select-none"
          >
            {headCell.isSortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id as SortableKeys)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc'
                      ? 'sorted descending'
                      : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
        <TableCell key={'actions'} align={'right'} className="select-none">
          Actions
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  numSelected: number;
  dense: boolean;
  handleChangeDense: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected, dense, handleChangeDense, onDelete } = props;
  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity,
            ),
        },
      ]}
      className="flex justify-between items-center px-4 py-2 border-mountain-100 border-b-2 rounded-t-3xl"
    >
      <span className='font-medium'>Post Automation Table</span>
      <div className="flex items-center gap-4">
        <FormControlLabel
          control={<Switch checked={dense} onChange={handleChangeDense} />}
          label="Dense padding"
        />
        {numSelected > 0 &&
          <Tooltip title="Delete Selected">
            <IconButton onClick={onDelete}>
              <IoTrashBin />
            </IconButton>
          </Tooltip>
        }
      </div>
    </Toolbar>
  );
}

interface ProjectTableProps {
  projects: AutoProjectListItem[];
  totalProjects: number;
  isLoading: boolean;
  order: Order;
  setOrder: (order: Order) => void;
  orderBy: SortableKeys;
  setOrderBy: (orderBy: SortableKeys) => void;
  page: number;
  setPage: (page: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (rowsPerPage: number) => void;
  onDelete: (projectIds: readonly number[]) => void;
  selected: readonly number[];
  setSelected: (newSelected: readonly number[]) => void;
}

export default function ProjectTable({
  projects,
  totalProjects,
  isLoading,
  order,
  setOrder,
  orderBy,
  setOrderBy,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  onDelete,
  selected,
  setSelected,
}: ProjectTableProps) {
  const navigate = useNavigate();
  const [dense, setDense] = useState(false);

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: SortableKeys,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = projects.map((n) => n.id);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
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

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-gray-500';
      case 'scheduled':
        return 'bg-yellow-500';
      case 'active':
        return 'bg-green-500';
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const formatToTitleCase = (str: string) => {
    if (!str || typeof str !== 'string') return '';
    const lower = str.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  return (
    <div className="flex bg-white border border-mountain-200 rounded-3xl w-full h-[calc(100vh-14rem)]">
      <div className="flex flex-col justify-between w-full">
        <div className="flex flex-col flex-grow overflow-hidden">
          <EnhancedTableToolbar
            numSelected={selected.length}
            dense={dense}
            handleChangeDense={handleChangeDense}
            onDelete={() => onDelete(selected)}
          />
          <TableContainer className="flex-grow custom-scrollbar">
            {isLoading && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <CircularProgress />
              </Box>
            )}
            {!isLoading && projects?.length === 0 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Typography>No projects found.</Typography>
              </Box>
            )}
            {!isLoading && projects?.length > 0 && (
              <Table
                stickyHeader
                sx={{
                  minWidth: 750,
                  '& .MuiTableCell-head': {
                    backgroundColor: '#ffffff',
                    fontWeight: 'bold',
                    borderBottom: '2px solid #e5e7eb',
                  },
                  '& .MuiTableRow-root:hover': {
                    backgroundColor: '#f0f4f8',
                  },
                  '& .MuiTableCell-body': {
                    borderBottom: '1px solid #e5e7eb',
                  },
                }}
                size={dense ? 'small' : 'medium'}
              >
                <ProjectTableHead
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={handleSelectAllClick}
                  onRequestSort={handleRequestSort}
                  rowCount={projects.length}
                />
                <TableBody>
                  {projects?.map((row) => {
                    const isItemSelected = selected.includes(row.id);
                    return (
                      <TableRow
                        hover
                        key={row.id}
                        selected={isItemSelected}
                        onClick={() =>
                          navigate(`/auto/projects/${row.id}/details`)
                        }
                        sx={{ cursor: 'pointer' }}
                        className="hover:bg-mountain-50 border-mountain-100 border-b-2"
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleClick(event, row.id);
                            }}
                          />
                        </TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          {row.title}
                        </TableCell>
                        <TableCell align="right">
                          <div className="flex flex-wrap justify-end gap-2">
                            {
                              <div className="bg-indigo-100 px-2 py-1 rounded">
                                {formatToTitleCase(row.platform.name)}
                              </div>
                            }
                          </div>
                        </TableCell>
                        <TableCell align="right">{row.postCount}</TableCell>
                        <TableCell align="right">
                          <span className="flex justify-end items-center gap-2 text-sm">
                            <span
                              className={`h-2 w-2 rounded-full ${getStatusColor(
                                row.status,
                              )}`}
                            ></span>
                            {/* CHANGE: Using the helper function here too */}
                            <span>{formatToTitleCase(row.status)}</span>
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          {row.nextPostAt
                            ? new Date(row.nextPostAt).toLocaleString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ whiteSpace: 'nowrap' }}
                          className="space-x-2"
                        >
                          <Tooltip title="Edit">
                            <Button
                              className="bg-indigo-50 border-1 border-mountain-200 font-normal"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/auto/projects/${row.id}/edit`);
                              }}
                            >
                              <AiFillEdit className="size-5 text-indigo-600" />
                            </Button>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <Button
                              color="error"
                              className="bg-red-50 border-1 border-mountain-200 font-normal"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete([row.id]);
                              }}
                            >
                              <IoTrashBin className="size-5 text-red-600" />
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalProjects}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          className="flex-shrink-0 border-mountain-100 border-t-2 overflow-hidden"
        />
      </div>
    </div>
  );
}
