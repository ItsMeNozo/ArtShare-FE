import {
  Box,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import {
  HeadCellItemTable,
  Order,
  SortableKeysItemTable,
} from '../../../projects/types/automation-project';

interface AutoPostsTableHeaderProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: SortableKeysItemTable,
  ) => void;
  order: Order;
  orderBy: string;
}

function AutoPostsTableHeader(props: AutoPostsTableHeaderProps) {
  const { order, orderBy, onRequestSort } = props;

  const createSortHandler =
    (property: SortableKeysItemTable) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow className="border-mountain-100 border-b-2">
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            className="select-none"
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell key={'actions'} align={'right'} className="select-none">
          Actions
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

export default AutoPostsTableHeader;

const headCells: readonly HeadCellItemTable[] = [
  {
    id: 'id',
    numeric: true,
    disablePadding: false,
    label: 'Id',
  },
  {
    id: 'content',
    numeric: false,
    disablePadding: true,
    label: 'Content',
  },
  {
    id: 'imageUrls',
    numeric: true,
    disablePadding: false,
    label: 'Images',
  },
  {
    id: 'status',
    numeric: true,
    disablePadding: false,
    label: 'Status',
  },
  {
    id: 'scheduledAt',
    numeric: true,
    disablePadding: false,
    label: 'Scheduled At',
  },
  {
    id: 'createdAt',
    numeric: true,
    disablePadding: false,
    label: 'Created At',
  },
];
