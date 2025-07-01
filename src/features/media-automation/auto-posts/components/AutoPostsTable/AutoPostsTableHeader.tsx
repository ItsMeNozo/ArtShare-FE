import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {
  HeadCellItemTable,
  ItemTableProps,
} from '../../../projects/types/automation-project';

function AutoPostsTableHeader(props: ItemTableProps) {
  const { onSelectAllClick, numSelected, rowCount } = props;

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
            className="select-none"
          >
            {headCell.label}
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
  // {
  //   id: 'content',
  //   numeric: false,
  //   disablePadding: true,
  //   label: 'Content',
  //   width: 200,
  // },
  {
    id: 'id',
    numeric: true,
    disablePadding: false,
    label: 'Id',
  },
  {
    id: 'imageUrl',
    numeric: true,
    disablePadding: false,
    label: 'Images Number',
  },
  {
    id: 'status',
    numeric: true,
    disablePadding: false,
    label: 'Status',
  },
  {
    id: 'scheduledTime',
    numeric: true,
    disablePadding: false,
    label: 'Scheduled Time',
  },
  {
    id: 'createdAt',
    numeric: true,
    disablePadding: false,
    label: 'Created At',
  },
];
