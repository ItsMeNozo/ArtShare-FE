import { useDeletePost } from '@/features/post/hooks/useDeletePost';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Post } from '@/types';
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
import Link from '@mui/material/Link';
import { MoreHorizontal } from 'lucide-react';
import React, { useState } from 'react';
import { AiOutlineLike } from 'react-icons/ai';
import { BiCommentDetail } from 'react-icons/bi';
import { HiOutlineEye } from 'react-icons/hi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

interface PostCardProps {
  post: Post;
  isOwner: boolean;
  username: string;
  onPostDeleted: (postId: number) => void;
}

interface PostMenuProps {
  post: Post;
  isOwner: boolean;
  onPostDeleted: (postId: number) => void;
}

const PostMenu: React.FC<PostMenuProps> = ({
  post,
  isOwner,
  onPostDeleted,
}) => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const open = Boolean(anchorEl);

  const { mutate: deletePostMutation } = useDeletePost({
    onSuccess: () => {
      onPostDeleted(post.id);
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
    navigate(`/post/${post.id}/edit`);
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
    deletePostMutation(post.id);
    setConfirmOpen(false);
  };

  if (!isOwner) return null;

  return (
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
        id={`post-menu-${post.id}`}
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
            Are you sure you want to delete "{post.title || 'this post'}"? This
            action cannot be undone.
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
  );
};

const PostCard: React.FC<PostCardProps> = ({
  post,
  isOwner,
  username,
  onPostDeleted,
}) => {
  return (
    <div className="group relative aspect-square overflow-hidden">
      <Link
        component={RouterLink}
        to={`/posts/${post.id}`}
        className="block h-full w-full"
        underline="none"
      >
        <img
          src={post.thumbnailUrl}
          alt={post.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-b from-transparent via-transparent to-black/70 p-3 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex w-full items-end justify-between">
            <div>
              <p className="truncate font-medium">{post.title || 'Untitled'}</p>
              <p className="text-xs break-words whitespace-normal text-gray-300">
                @{username}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-1 text-xs">
              <div className="flex items-center space-x-1">
                <span className="font-semibold">{post.likeCount}</span>
                <AiOutlineLike className="size-4" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold">{post.commentCount}</span>
                <BiCommentDetail className="size-4" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold">{post.viewCount}</span>
                <HiOutlineEye className="size-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Post Menu - only show for post owner */}
      <PostMenu post={post} isOwner={isOwner} onPostDeleted={onPostDeleted} />
    </div>
  );
};

export default PostCard;
