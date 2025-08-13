import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { MoreHorizontal } from 'lucide-react';
import React, { useState } from 'react';
import { AiOutlineLike } from 'react-icons/ai';
import { BiCommentDetail } from 'react-icons/bi';
import { HiOutlineEye } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

import { GalleryPhoto } from '@/components/gallery/Gallery';
import { useDeletePost } from '@/features/post/hooks/useDeletePost';
import { useSnackbar } from '@/hooks/useSnackbar';
import { RenderPhotoContext } from 'react-photo-album';
import { Link } from 'react-router-dom';

export interface UserPostRendererOptions {
  isOwner: boolean;
  onPostDeleted: (postId: number) => void;
  username: string;
}

export const UserPostRenderer = (
  context: RenderPhotoContext<GalleryPhoto>,
  options: UserPostRendererOptions,
) => {
  const { photo, width, height } = context;
  const { isOwner, onPostDeleted, username } = options;
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const open = Boolean(anchorEl);

  const { mutate: deletePostMutation } = useDeletePost({
    username: username,
    onSuccess: () => {
      onPostDeleted(photo.postId);
      showSnackbar('Post successfully deleted!', 'success');
    },
    onError: (errorMessage) => {
      showSnackbar(errorMessage, 'error');
    },
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/post/${photo.postId}/edit`);
    handleCloseMenu();
  };

  const handleDelete = () => {
    setConfirmOpen(true);
    handleCloseMenu();
  };

  const handleCloseConfirmDelete = () => {
    setConfirmOpen(false);
  };

  const handleDeleteConfirmed = () => {
    deletePostMutation(photo.postId);
    setConfirmOpen(false);
  };

  return (
    <div
      className="group relative"
      style={{
        height: height,
        width: width,
      }}
    >
      <Link
        to={`/posts/${photo.postId}`}
        className="block h-full w-full rounded-lg"
      >
        <img
          src={photo.src}
          alt={photo.title}
          className="h-full w-full rounded-lg object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-end rounded-lg bg-gradient-to-b from-transparent via-transparent to-black/70 p-3 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex w-full items-end justify-between">
            <div>
              <p className="line-clamp-1 font-medium">
                {photo.title || 'Untitled'}
              </p>
              <p className="text-xs break-words whitespace-normal text-gray-300">
                @{username}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-1 text-xs">
              <div className="flex items-center space-x-1">
                <span className="font-semibold">{photo.likeCount}</span>
                <AiOutlineLike className="size-4" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold">{photo.commentCount}</span>
                <BiCommentDetail className="size-4" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold">{photo.viewCount}</span>
                <HiOutlineEye className="size-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>

      {isOwner && (
        <>
          <IconButton
            aria-label="post options"
            aria-controls={open ? 'post-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            size="small"
            className="rounded-full bg-black/40 p-1.5 text-white opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-black/60 hover:text-white"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 20,
            }}
          >
            <MoreHorizontal size={18} />
          </IconButton>

          <Menu
            id={`post-menu-${photo.postId}`}
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseMenu}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleEdit}>
              <Typography variant="body2">Edit</Typography>
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <Typography variant="body2" sx={{ color: 'error.main' }}>
                Delete
              </Typography>
            </MenuItem>
          </Menu>

          <Dialog open={confirmOpen} onClose={handleCloseConfirmDelete}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete "{photo.title || 'this post'}"?
                This action cannot be undone.
              </Typography>
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
      )}
    </div>
  );
};
