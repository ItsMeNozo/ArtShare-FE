import { useUser } from '@/contexts/user';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Blog } from '@/types/blog';
import { CircularProgress, IconButton, Menu } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { IoMdMore } from 'react-icons/io';
import { IoBookOutline, IoFilter } from 'react-icons/io5';
import { MdOutlineAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import {
  BlogQueryParams,
  fetchBlogsByUsername,
} from '../blog-details/api/blog';
import { BlogDeleteConfirmDialog } from './components/BlogDeleteConfirmDialog';
import { useDeleteBlog } from './hooks/useDeleteBlog';

// Define a type for the sort order
type BlogSortOrder = 'latest' | 'oldest' | 'last7days' | 'last30days';

// Enhanced menu state to handle right-click positioning
interface MenuState {
  anchorEl: null | HTMLElement;
  currentBlogId: null | number;
  anchorPosition?: { top: number; left: number };
  isRightClick?: boolean;
}

// Move helper functions outside component to prevent recreation
const getThumbnail = (blog: Blog): string => {
  if (Array.isArray(blog.pictures) && blog.pictures[0]) {
    return blog.pictures[0];
  }
  return 'https://placehold.co/600x400';
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const truncateTitle = (title: string, maxLength: number = 30): string => {
  return title.length > maxLength
    ? `${title.substring(0, maxLength)}...`
    : title;
};

// Memoized blog item component
const BlogItem = React.memo(
  ({
    blog,
    onDocumentClick,
    onMenuClick,
    onContextMenu,
    menuState,
  }: {
    blog: Blog;
    onDocumentClick: (id: number) => void;
    onMenuClick: (
      event: React.MouseEvent<HTMLButtonElement>,
      id: number,
    ) => void;
    onContextMenu: (
      event: React.MouseEvent<HTMLDivElement>,
      id: number,
    ) => void;
    menuState: MenuState;
  }) => {
    const handleClick = useCallback(
      (_event: React.MouseEvent<HTMLDivElement>) => {
        // Close menu if clicking on document while menu is open
        if (menuState.anchorEl && menuState.currentBlogId === blog.id) {
          return;
        }
        onDocumentClick(blog.id);
      },
      [blog.id, onDocumentClick, menuState.anchorEl, menuState.currentBlogId],
    );

    const handleContextMenu = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        onContextMenu(event, blog.id);
      },
      [blog.id, onContextMenu],
    );

    const handleMenuClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onMenuClick(event, blog.id);
      },
      [blog.id, onMenuClick],
    );

    const handleImageError = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = 'https://placehold.co/600x400';
      },
      [],
    );

    return (
      <div
        className="dark:bg-mountain-800 border-mountain-200 dark:border-mountain-600 flex cursor-pointer flex-col items-center justify-center space-y-4 rounded-lg border bg-white pb-2 transition-all duration-200 hover:scale-105 hover:border-indigo-600 hover:shadow-lg dark:hover:border-indigo-400"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {/* Document Thumbnail */}
        <div className="bg-mountain-50 dark:bg-mountain-700 border-mountain-50 dark:border-mountain-600 flex aspect-square w-full items-center justify-center overflow-hidden rounded-t-lg border">
          <img
            src={getThumbnail(blog)}
            alt={blog.title}
            className="h-full w-full object-cover"
            onError={handleImageError}
          />
        </div>

        {/* Document Info */}
        <div className="flex w-full flex-col items-start justify-start space-y-2">
          <p
            className="dark:bg-mountain-800 text-mountain-800 dark:text-mountain-200 line-clamp-1 w-full bg-white px-2 text-left text-sm font-medium select-none"
            title={blog.title}
          >
            {truncateTitle(blog.title)}
          </p>
          <div className="flex w-full items-center justify-between">
            <p className="dark:bg-mountain-800 text-mountain-600 dark:text-mountain-400 w-full truncate bg-white px-2 text-left text-xs select-none">
              {formatDate(blog.createdAt)}
            </p>
            <IconButton
              onClick={handleMenuClick}
              className="hover:bg-mountain-50 dark:bg-mountain-800 dark:hover:bg-mountain-700 text-mountain-600 dark:text-mountain-400 mr-2 h-6 w-6 cursor-pointer bg-white"
              size="small"
            >
              <IoMdMore className="size-5" />
            </IconButton>
          </div>
        </div>
      </div>
    );
  },
);

BlogItem.displayName = 'BlogItem';

const DocumentDashboard = () => {
  const [order, setOrder] = useState<BlogSortOrder>('latest');
  const [userBlogs, setUserBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { user } = useUser();

  const [menuState, setMenuState] = useState<MenuState>({
    anchorEl: null,
    currentBlogId: null,
  });

  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    open: boolean;
    blogId: number | null;
    blogTitle: string | null;
  }>({ open: false, blogId: null, blogTitle: null });

  const { mutate: deleteBlogMutation, isPending: isDeletingBlog } =
    useDeleteBlog({
      onSuccess: (blogId) => {
        setUserBlogs((prev) => prev.filter((blog) => blog.id !== blogId));
        showSnackbar('Document deleted successfully', 'success', undefined, {
          vertical: 'top',
          horizontal: 'center',
        });
        setDeleteConfirmState({ open: false, blogId: null, blogTitle: null });
      },
      onError: (errorMessage) => {
        showSnackbar(errorMessage, 'error');
        setDeleteConfirmState({ open: false, blogId: null, blogTitle: null });
      },
    });

  // Memoize handlers to prevent recreation
  const handleChange = useCallback((event: SelectChangeEvent) => {
    setOrder(event.target.value as BlogSortOrder);
  }, []);

  const handleCreateBlankDocument = useCallback(() => {
    navigate('/docs/new');
  }, [navigate]);

  const handleCreateTutorialDocument = useCallback(() => {
    navigate('/docs/new?template=tutorial');
  }, [navigate]);

  const handleDocumentClick = useCallback(
    (blogId: number) => {
      if (menuState.anchorEl && menuState.currentBlogId === blogId) {
        setMenuState({
          anchorEl: null,
          currentBlogId: null,
          anchorPosition: undefined,
          isRightClick: false,
        });
        return;
      }
      navigate(`/docs/${blogId}`);
    },
    [menuState.anchorEl, menuState.currentBlogId, navigate],
  );

  const handleMenuClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, blogId: number) => {
      event.stopPropagation();
      setMenuState({
        anchorEl: event.currentTarget,
        currentBlogId: blogId,
        anchorPosition: undefined,
        isRightClick: false,
      });
    },
    [],
  );

  const handleContextMenu = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, blogId: number) => {
      event.preventDefault();
      event.stopPropagation();
      setMenuState({
        anchorEl: null,
        currentBlogId: blogId,
        anchorPosition: {
          top: event.clientY,
          left: event.clientX,
        },
        isRightClick: true,
      });
    },
    [],
  );

  const handleMenuClose = useCallback(() => {
    setMenuState({
      anchorEl: null,
      currentBlogId: null,
      anchorPosition: undefined,
      isRightClick: false,
    });
  }, []);

  const handleEditMenuClick = useCallback(
    (blogId: number) => {
      handleMenuClose();
      navigate(`/docs/${blogId}`);
    },
    [navigate, handleMenuClose],
  );

  const handleDeleteMenuClick = useCallback(
    (blogId: number) => {
      handleMenuClose();
      const blog = userBlogs.find((b) => b.id === blogId);
      setDeleteConfirmState({
        open: true,
        blogId,
        blogTitle: blog?.title || null,
      });
    },
    [userBlogs, handleMenuClose],
  );

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmState.blogId) {
      deleteBlogMutation(deleteConfirmState.blogId);
    }
  }, [deleteConfirmState.blogId, deleteBlogMutation]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmState({ open: false, blogId: null, blogTitle: null });
  }, []);

  // Memoize document count text
  const documentCountText = useMemo(() => {
    return `${userBlogs.length} ${userBlogs.length === 1 ? 'document' : 'documents'}`;
  }, [userBlogs.length]);

  // Memoize empty state message
  const emptyStateMessage = useMemo(() => {
    return order === 'latest'
      ? 'Get started by creating your first document.'
      : 'No documents found for the selected criteria.';
  }, [order]);

  // Fetch documents effect
  useEffect(() => {
    const fetchUserDocuments = async () => {
      if (!user?.username) {
        setIsLoading(false);
        return;
      }

      const params: BlogQueryParams = {
        take: 100,
        skip: 0,
        sortField: 'updatedAt',
        dateRange: 'all',
      };

      switch (order) {
        case 'latest':
          params.sortBy = 'latest';
          break;
        case 'oldest':
          params.sortBy = 'oldest';
          break;
        case 'last7days':
          params.sortBy = 'latest';
          params.dateRange = 'last7days';
          break;
        case 'last30days':
          params.sortBy = 'latest';
          params.dateRange = 'last30days';
          break;
      }

      try {
        setIsLoading(true);
        const blogs = await fetchBlogsByUsername(user.username, params);
        setUserBlogs(blogs);
        setError(null);
      } catch (err) {
        console.error('Error fetching user documents:', err);
        setError('Failed to load documents');
        setUserBlogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDocuments();
  }, [user?.username, order]);

  // Memoize loading component
  const loadingComponent = useMemo(
    () => (
      <div className="col-span-full flex items-center justify-center py-8">
        <CircularProgress
          size={32}
          sx={{ color: 'var(--loader-color)' }}
          style={{ '--loader-color': 'rgb(79 70 229)' } as React.CSSProperties}
        />
        <span className="ml-2 text-gray-700 dark:text-gray-300">
          Loading documents...
        </span>
      </div>
    ),
    [],
  );

  // Memoize error component
  const errorComponent = useMemo(
    () => (
      <div className="col-span-full flex items-center justify-center py-8 text-red-500 dark:text-red-400">
        <span>{error}</span>
      </div>
    ),
    [error],
  );

  // Memoize empty state component
  const emptyStateComponent = useMemo(
    () => (
      <div className="col-span-full flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500">
            <IoBookOutline className="h-full w-full" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
            No documents found
          </h3>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            {emptyStateMessage}
          </p>
          <button
            onClick={handleCreateBlankDocument}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
          >
            <MdOutlineAdd className="mr-2 h-4 w-4" />
            Create Document
          </button>
        </div>
      </div>
    ),
    [emptyStateMessage, handleCreateBlankDocument],
  );

  return (
    <div className="custom-scrollbar flex h-screen flex-col items-center overflow-auto rounded-t-3xl">
      {/* Top Templates Section */}
      <div className="border-mountain-50 dark:border-mountain-700 dark:bg-mountain-900 flex h-fit w-full justify-center bg-white">
        <div className="flex h-full w-fit flex-col items-center justify-center space-y-2 p-4">
          <div className="flex h-full space-x-4">
            {/* Blank Document Template */}
            <div
              className="group flex cursor-pointer flex-col justify-center space-y-4"
              onClick={handleCreateBlankDocument}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ')
                  handleCreateBlankDocument();
              }}
              aria-label="Create Blank Document"
            >
              <div className="bg-mountain-50 dark:bg-mountain-800 dark:border-mountain-600 flex h-48 w-42 items-center justify-center border-1 border-white transition-all duration-200 group-hover:scale-105 hover:border-indigo-600 hover:shadow-lg dark:hover:border-indigo-400">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 transition-transform group-hover:scale-110 dark:from-indigo-700 dark:to-purple-700">
                  <MdOutlineAdd className="size-10 text-gray-800 dark:text-gray-200" />
                </div>
              </div>
              <p className="text-mountain-800 dark:text-mountain-200 text-center text-sm font-medium">
                Blank Document
              </p>
              <p className="text-mountain-600 dark:text-mountain-400 text-center text-xs">
                Start typing to create
              </p>
            </div>

            {/* Tutorial Template */}
            <div
              className="group flex cursor-pointer flex-col justify-center space-y-4"
              onClick={handleCreateTutorialDocument}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ')
                  handleCreateTutorialDocument();
              }}
              aria-label="Create Tutorial Document"
            >
              <div className="bg-mountain-50 dark:bg-mountain-800 dark:border-mountain-600 flex h-48 w-42 items-center justify-center border-1 border-white transition-all duration-200 group-hover:scale-105 hover:border-indigo-600 hover:shadow-lg dark:hover:border-indigo-400">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 transition-transform group-hover:scale-110 dark:from-indigo-700 dark:to-purple-700">
                  <IoBookOutline className="size-10 text-gray-800 dark:text-gray-200" />
                </div>
              </div>
              <p className="text-mountain-800 dark:text-mountain-200 text-center text-sm font-medium">
                Tutorial Template
              </p>
              <p className="text-mountain-600 dark:text-mountain-400 text-center text-xs">
                Pre-formatted structure
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="border-mountain-200 dark:border-mountain-700 flex w-full flex-col space-y-6 border-t-1">
        {/* Header with Filter */}
        <div className="dark:bg-mountain-800 sticky top-0 flex h-fit w-full items-center justify-between bg-white px-4 py-3 shadow-md">
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Recent projects
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {documentCountText}
            </p>
          </div>
          <div className="flex items-center">
            <div className="flex">
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select
                  value={order}
                  onChange={handleChange}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Order By' }}
                  MenuProps={{
                    disableScrollLock: true,
                    PaperProps: {
                      sx: {
                        backgroundColor: 'var(--select-bg, white)',
                        color: 'var(--select-text, #374151)',
                        boxShadow: 3,
                        borderRadius: 2,
                        border: '1px solid var(--select-border, #d1d5db)',
                        backdropFilter: 'blur(8px)',
                        '& .MuiMenuItem-root': {
                          color: 'var(--select-text, #374151)',
                          '&:hover': {
                            backgroundColor: 'var(--select-hover, #f3f4f6)',
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'var(--select-selected, #e0e7ff)',
                          },
                        },
                      },
                    },
                  }}
                  sx={{
                    backgroundColor: 'var(--select-bg, white)',
                    color: 'var(--select-text, #374151)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--select-border, #d1d5db)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--select-border-hover, #9ca3af)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--select-border-focus, #6366f1)',
                    },
                    '& .MuiSelect-icon': {
                      color: 'var(--select-text, #374151)',
                    },
                  }}
                  className="relative h-10 w-36 rounded-full pl-8"
                  style={
                    {
                      '--select-bg': 'rgba(255,255,255,0.98)',
                      '--select-text': '#374151',
                      '--select-border': '#d1d5db',
                      '--select-border-hover': '#9ca3af',
                      '--select-border-focus': '#6366f1',
                      '--select-hover': '#f3f4f6',
                      '--select-selected': '#e0e7ff',
                    } as React.CSSProperties
                  }
                >
                  <MenuItem value={'latest'}>Latest</MenuItem>
                  <MenuItem value={'oldest'}>Oldest</MenuItem>
                  <MenuItem value={'last7days'}>Last 7 days</MenuItem>
                  <MenuItem value={'last30days'}>Last 30 days</MenuItem>
                </Select>
                <IoFilter className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-600 dark:text-gray-400" />
              </FormControl>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid min-h-[calc(100vh-4rem)] grid-cols-2 items-start gap-6 p-6 pb-96 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {isLoading
            ? loadingComponent
            : error
              ? errorComponent
              : userBlogs.length === 0
                ? emptyStateComponent
                : userBlogs.map((blog) => (
                    <BlogItem
                      key={blog.id}
                      blog={blog}
                      onDocumentClick={handleDocumentClick}
                      onMenuClick={handleMenuClick}
                      onContextMenu={handleContextMenu}
                      menuState={menuState}
                    />
                  ))}
        </div>
      </div>

      {/* Context Menu */}
      <Menu
        anchorEl={menuState.anchorEl}
        open={Boolean(menuState.anchorEl) || Boolean(menuState.anchorPosition)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        // Use anchorPosition for right-click menu positioning
        anchorPosition={menuState.anchorPosition}
        anchorReference={menuState.isRightClick ? 'anchorPosition' : 'anchorEl'}
        PaperProps={{
          sx: {
            backgroundColor: 'var(--menu-bg)',
            color: 'var(--menu-text)',
            border: '1px solid var(--menu-border)',
            minWidth: 120,
            boxShadow: 3,
            borderRadius: 2,
            '& .MuiMenuItem-root': {
              color: 'var(--menu-text)',
              fontSize: '0.875rem',
              padding: '8px 16px',
              '&:hover': {
                backgroundColor: 'var(--menu-hover)',
              },
            },
          },
        }}
        style={
          {
            '--menu-bg': 'white',
            '--menu-text': '#374151',
            '--menu-border': '#d1d5db',
            '--menu-hover': '#f3f4f6',
          } as React.CSSProperties
        }
      >
        <MenuItem
          onClick={() => {
            if (menuState.currentBlogId) {
              handleEditMenuClick(menuState.currentBlogId);
            }
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuState.currentBlogId) {
              handleDeleteMenuClick(menuState.currentBlogId);
            }
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Dark mode styles for MUI components */}
      <style>{`
        .dark [style*="--select-bg"] {
          --select-bg: rgb(41 37 36) !important;
          --select-text: rgb(229 231 235) !important;
          --select-border: rgb(87 83 78) !important;
          --select-border-hover: rgb(120 113 108) !important;
          --select-border-focus: rgb(129 140 248) !important;
          --select-hover: rgb(68 64 60) !important;
          --select-selected: rgb(67 56 202) !important;
        }

        .dark [style*="--menu-bg"] {
          --menu-bg: rgb(41 37 36) !important;
          --menu-text: rgb(229 231 235) !important;
          --menu-border: rgb(87 83 78) !important;
          --menu-hover: rgb(68 64 60) !important;
        }

        .dark [style*="--loader-color"] {
          --loader-color: rgb(129 140 248) !important;
        }
      `}</style>

      {/* Delete Confirmation Dialog */}
      <BlogDeleteConfirmDialog
        open={deleteConfirmState.open}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        submitting={isDeletingBlog}
        blogTitle={deleteConfirmState.blogTitle || undefined}
      />
    </div>
  );
};

export default DocumentDashboard;
