import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import React, { useState } from 'react';
import {
  FiAlertTriangle,
  FiEdit2,
  FiMoreVertical,
  FiTrash2,
} from 'react-icons/fi';

interface PostMenuProps {
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
}

export const PostMenu: React.FC<PostMenuProps> = ({
  isOwner,
  onEdit,
  onDelete,
  onReport,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    onEdit();
    handleCloseMenu();
  };

  const handleOpenConfirmDelete = () => {
    setConfirmOpen(true);
    handleCloseMenu();
  };

  const handleCloseConfirmDelete = () => {
    setConfirmOpen(false);
  };

  const handleDeleteConfirmed = () => {
    onDelete();
    setConfirmOpen(false);
  };

  const handleReportClick = () => {
    onReport();
    handleCloseMenu();
  };

  return (
    <>
      <IconButton
        aria-label="post options"
        aria-controls={open ? 'post-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        size="small"
        className="rounded-full p-1.5 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <FiMoreVertical fontSize={20} />
      </IconButton>

      <Menu
        id="post-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            elevation: 2,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
              mt: 1.5,
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
          list: {
            'aria-labelledby': 'post-options-button',
          },
        }}
      >
        {isOwner ? (
          [
            <MenuItem key="edit" onClick={handleEditClick}>
              <ListItemIcon>
                <FiEdit2 fontSize="1.1rem" />
              </ListItemIcon>
              <ListItemText
                slotProps={{
                  primary: {
                    sx: { fontSize: '0.9rem' },
                  },
                }}
              >
                Edit
              </ListItemText>
            </MenuItem>,
            <MenuItem
              key="delete"
              onClick={handleOpenConfirmDelete}
              sx={{
                '&:hover': {
                  color: 'error.main',
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                },
              }}
            >
              <ListItemIcon>
                <FiTrash2 fontSize="1.1rem" color="inherit" />
              </ListItemIcon>
              <ListItemText
                slotProps={{
                  primary: {
                    sx: { fontSize: '0.9rem' },
                  },
                }}
              >
                Delete
              </ListItemText>
            </MenuItem>,
          ]
        ) : (
          <MenuItem onClick={handleReportClick}>
            <ListItemIcon>
              <FiAlertTriangle fontSize="1.1rem" />
            </ListItemIcon>
            <ListItemText
              slotProps={{
                primary: {
                  sx: { fontSize: '0.9rem' },
                },
              }}
            >
              Report
            </ListItemText>
          </MenuItem>
        )}
      </Menu>

      <Dialog open={confirmOpen} onClose={handleCloseConfirmDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this post? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDelete}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteConfirmed}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
