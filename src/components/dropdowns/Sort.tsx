import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import * as React from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';

const sortOptions = [
  'Sort by Relevance',
  'Sort by Likes',
  'Sort by Latest',
  'Trending Now',
];

export default function SortMenu({
  sort,
  setSort,
}: {
  sort: string;
  setSort: (val: string) => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (option?: string) => {
    if (option) {
      setSort(option);
    }
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="sort-button"
        aria-controls={open ? 'sort-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        sx={{
          px: 2,
          py: 1,
          textTransform: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: '#F9FAFB',
          '&:hover': {
            backgroundColor: '#F3F4F6',
          },
        }}
        className="hover:bg-mountain-50 bg-white font-normal"
      >
        {sort}
        <IoMdArrowDropdown />
      </Button>
      <Menu
        id="sort-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        disableScrollLock
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              ml: -2,
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              width: 200,
            },
          },
        }}
      >
        {sortOptions.map((option) => (
          <MenuItem
            key={option}
            selected={option === sort}
            onClick={() => handleClose(option)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#f6f6f6',
                borderLeft: '4px solid #6366F1',
              },
              '&:hover': {
                backgroundColor: '#e7e7e7',
              },
              pl: 2,
            }}
            className="text-mountain-950 text-sm"
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
