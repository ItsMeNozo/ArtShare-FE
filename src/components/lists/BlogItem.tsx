import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

//Libs
// import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import Avatar from 'boring-avatars';

//Icons
import { MoreVertical } from 'lucide-react';
import { AiOutlineLike } from 'react-icons/ai';
import { BiComment } from 'react-icons/bi';

//Components
import { getPlainTextPreview } from '@/features/blog-details/utils/blog';
import { useDeleteBlog } from '@/features/write-blog/hooks/useDeleteBlog';
import { useSnackbar } from '@/hooks/useSnackbar';
import ReactTimeAgo from 'react-time-ago';

//Style
type Author = {
  username: string;
  avatar: string;
};

type BlogItemProps = {
  blogId: string;
  author: Author;
  title: string;
  content: string;
  createdAt: string;
  timeReading: string;
  category: string;
  thumbnail: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isOwner?: boolean;
  onBlogDeleted?: (blogId: string) => void;
};

const BlogItem: React.FC<BlogItemProps> = ({
  blogId,
  author,
  title,
  content,
  createdAt,
  timeReading,
  category,
  thumbnail,
  likeCount,
  commentCount,
  isOwner,
  onBlogDeleted,
}) => {
  const navigate = useNavigate();
  const handleCardClick = () => {
    navigate(`/blogs/${blogId}`);
  };
  const [open, setOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  // const handleClickMoreButton = (e: React.MouseEvent<HTMLElement>) => {
  //     e.stopPropagation();
  //     setOpen(true);
  // };

  useEffect(() => {
    const handleScroll = () => {
      setOpen(false);
    };

    if (open) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [open]);

  return (
    <div
      key={blogId}
      className="group relative flex space-x-4 bg-white dark:bg-mountain-900 p-4 border border-mountain-200 hover:border-indigo-400 dark:border-mountain-700 dark:hover:border-indigo-500 rounded-lg w-full transition-colors duration-200"
    >
      <div
        onClick={handleCardClick}
        className="flex bg-black dark:bg-mountain-800 rounded-lg w-64 h-48 overflow-hidden cursor-pointer shrink-0"
      >
        <img
          src={thumbnail}
          className="w-full h-full object-cover"
          alt={title}
        />
      </div>
      <div className="flex w-full">
        <div className="flex flex-col justify-between space-y-2 w-full">
          <div className="flex justify-between w-full">
            <div className="flex items-center space-x-2 font-thin text-mountain-600 dark:text-mountain-400 capitalize">
              <p>{category.trim() ? category : 'Uncategorized'}</p>
              <span>•</span>
              <p>{timeReading}</p>
            </div>
          </div>
          <p
            className="font-medium text-gray-900 hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-gray-100 text-lg line-clamp-1 duration-300 ease-in-out cursor-pointer"
            onClick={handleCardClick}
          >
            {title}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {getPlainTextPreview(content)}
          </p>
          <div className="flex justify-between w-full">
            <div className="flex items-center space-x-2">
              {author.avatar && !avatarError ? (
                <img
                  src={author.avatar}
                  className="border border-gray-200 dark:border-mountain-700 rounded-full w-12 h-12"
                  alt={author.username}
                  onError={handleAvatarError}
                />
              ) : (
                <Avatar
                  name={author.username || 'Unknown'}
                  size={48}
                  variant="beam"
                  colors={['#84bfc3', '#ff9b62', '#d96153']}
                />
              )}
              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                {author.username}
              </p>
              <span className="text-gray-500 dark:text-gray-500">•</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {createdAt && !isNaN(new Date(createdAt).getTime()) ? (
                  <ReactTimeAgo className='capitalize' date={new Date(createdAt)} locale="en-US" timeStyle="round-minute" tick={false} />
                ) : (
                  'Unknown time'
                )}
              </span>
            </div>
            <div className="flex items-center w-fit">
              <Tooltip title="Like">
                <Button className="h-full font-normal text-mountain-400 hover:text-mountain-950 dark:hover:text-mountain-100 dark:text-mountain-500">
                  <AiOutlineLike className="mr-1 size-4" />
                  <p>{likeCount}</p>
                </Button>
              </Tooltip>
              <Tooltip title="Comment">
                <Button className="h-full font-normal text-mountain-400 hover:text-mountain-950 dark:hover:text-mountain-100 dark:text-mountain-500">
                  <BiComment className="mr-1 size-4" />
                  <p>{commentCount}</p>
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Menu - only show for blog owner */}
      {isOwner && (
        <BlogMenu
          blog={{ id: blogId, title }}
          isOwner={isOwner}
          onBlogDeleted={onBlogDeleted}
        />
      )}
    </div>
  );
};

interface BlogMenuProps {
  blog: { id: string; title: string };
  isOwner: boolean;
  onBlogDeleted?: (blogId: string) => void;
}

const BlogMenu: React.FC<BlogMenuProps> = ({
  blog,
  isOwner,
  onBlogDeleted,
}) => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const open = Boolean(anchorEl);

  const { mutate: deleteBlogMutation } = useDeleteBlog({
    onSuccess: () => {
      onBlogDeleted?.(blog.id);
      showSnackbar('Blog successfully deleted!', 'success');
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
    navigate(`/docs/${blog.id}`);
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
    deleteBlogMutation(blog.id);
    setConfirmOpen(false);
  };

  if (!isOwner) return null;

  return (
    <>
      <IconButton
        aria-label="blog options"
        aria-controls={open ? 'blog-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        size="small"
        className="bg-white/80 hover:bg-white dark:bg-mountain-800/80 dark:hover:bg-mountain-700 opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-gray-600 hover:text-gray-800 dark:hover:text-gray-200 dark:text-gray-400 transition-all duration-200"
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 20,
        }}
      >
        <MoreVertical size={18} />
      </IconButton>

      <Menu
        id={`blog-menu-${blog.id}`}
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
            Are you sure you want to delete "{blog.title || 'this blog'}"? This
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

export default BlogItem;
