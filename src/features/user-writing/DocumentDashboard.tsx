import { TUTORIAL_TEMPLATE_HTML } from '@/constants/template';
import { useUser } from '@/contexts/user';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Blog } from '@/types/blog';
import { CircularProgress, IconButton, Menu } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React, { useEffect, useState } from 'react';
import { IoMdMore } from 'react-icons/io';
import { IoBookOutline, IoFilter } from 'react-icons/io5';
import { MdOutlineAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import {
  BlogQueryParams,
  fetchBlogsByUsername,
} from '../blog-details/api/blog';
import { CreateBlogPayload, createNewBlog } from './api/blog.api';
import { BlogDeleteConfirmDialog } from './components/BlogDeleteConfirmDialog';
import { useDeleteBlog } from './hooks/useDeleteBlog';

// Define a type for the sort order
type BlogSortOrder = 'latest' | 'oldest' | 'last7days' | 'last30days';

const DocumentDashboard = () => {
  // Set "latest" as the default order
  const [order, setOrder] = React.useState<BlogSortOrder>('latest');
  const [userBlogs, setUserBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { user } = useUser();

  const [menuState, setMenuState] = useState<{
    anchorEl: null | HTMLElement;
    currentBlogId: null | number;
  }>({ anchorEl: null, currentBlogId: null });

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

  // Function to get thumbnail image from blog
  const getThumbnail = (blog: Blog): string => {
    if (Array.isArray(blog.pictures) && blog.pictures[0]) {
      return blog.pictures[0];
    }
    return 'https://placehold.co/600x400';
  };

  useEffect(() => {
    const fetchUserDocuments = async () => {
      if (!user?.username) {
        setIsLoading(false);
        return;
      }

      // 1. Map frontend state to backend query params
      const params: BlogQueryParams = {
        take: 100,
        skip: 0,
        sortField: 'updatedAt', // Sort by the last updated date to match original logic
        dateRange: 'all', // Default date range
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
        // 2. Fetch data using the new params. The backend does the filtering and sorting.
        const blogs = await fetchBlogsByUsername(user.username, params);

        // 3. Set the state directly. No more client-side logic is needed here.
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

  const handleChange = (event: SelectChangeEvent) => {
    setOrder(event.target.value as BlogSortOrder);
  };

  const createNewDocument = async () => {
    try {
      const newBlogPayload: CreateBlogPayload = {
        title: 'Untitled Document',
        isPublished: false,
        content: '<p></p>',
      };
      const createdBlog = await createNewBlog(newBlogPayload);
      navigate(`/docs/${createdBlog.id}`);
    } catch (error) {
      showSnackbar('Failed to create blog', 'error');
      console.error('Error creating document:', error);
    }
  };

  const createTutorialDocument = async () => {
    try {
      const payload: CreateBlogPayload = {
        title: 'Untitled Tutorial',
        isPublished: false,
        content: TUTORIAL_TEMPLATE_HTML,
      };
      const newBlog = await createNewBlog(payload);
      navigate(`/docs/${newBlog.id}`);
    } catch (err) {
      showSnackbar('Failed to create tutorial', 'error');
      console.error(err);
    }
  };

  const handleDocumentClick = (blogId: number) => {
    if (menuState.anchorEl && menuState.currentBlogId === blogId) {
      handleMenuClose();
      return;
    }
    navigate(`/docs/${blogId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const truncateTitle = (title: string, maxLength: number = 30) => {
    return title.length > maxLength
      ? `${title.substring(0, maxLength)}...`
      : title;
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    blogId: number,
  ) => {
    event.stopPropagation();
    setMenuState({ anchorEl: event.currentTarget, currentBlogId: blogId });
  };

  const handleMenuClose = () => {
    setMenuState({ anchorEl: null, currentBlogId: null });
  };

  const onEditMenuClick = (blogId: number) => {
    handleMenuClose();
    navigate(`/docs/${blogId}`);
  };

  const onDeleteMenuClick = async (blogId: number) => {
    handleMenuClose(); // Close menu first
    const blog = userBlogs.find((b) => b.id === blogId);
    setDeleteConfirmState({
      open: true,
      blogId,
      blogTitle: blog?.title || null,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmState.blogId) {
      deleteBlogMutation(deleteConfirmState.blogId);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmState({ open: false, blogId: null, blogTitle: null });
  };

  return (
    <div className="custom-scrollbar flex h-screen flex-col items-center overflow-auto rounded-t-3xl">
      {/* Top Templates Section */}
      <div className="border-mountain-50 dark:border-mountain-700 flex h-fit w-full justify-center bg-white">
        <div className="flex h-full w-fit flex-col items-center justify-center space-y-2 p-4">
          <div className="flex h-full space-x-4">
            {/* Blank Document Template */}
            <div
              className="flex cursor-pointer flex-col justify-center space-y-4"
              onClick={() => createNewDocument()}
            >
              <div className="bg-mountain-50 dark:bg-mountain-800 dark:border-mountain-600 flex h-48 w-42 items-center justify-center border-1 border-white transition-colors hover:border-indigo-600 dark:hover:border-indigo-400">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-700 dark:to-purple-700">
                  <MdOutlineAdd className="size-10 text-gray-800 dark:text-gray-200" />
                </div>
              </div>
              <p className="text-mountain-800 dark:text-mountain-200 text-center text-sm">
                Blank Document
              </p>
            </div>
            {/* Tutorial Template */}
            <div
              className="flex cursor-pointer flex-col justify-center space-y-4"
              onClick={() => createTutorialDocument()}
            >
              <div className="bg-mountain-50 dark:bg-mountain-800 dark:border-mountain-600 flex h-48 w-42 items-center justify-center border-1 border-white transition-colors hover:border-indigo-600 dark:hover:border-indigo-400">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-700 dark:to-purple-700">
                  <IoBookOutline className="size-10 text-gray-800 dark:text-gray-200" />
                </div>
              </div>
              <p className="text-mountain-800 dark:text-mountain-200 text-center text-sm">
                Tutorial Template
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Documents Section */}
      <div className="border-mountain-200 flex w-full flex-col space-y-6 border-t-1">
        {/* Header with Filter */}
        <div className="dark:bg-mountain-800 sticky top-0 flex h-fit w-full items-center justify-between bg-white px-4 shadow-md">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Recent projects
          </p>
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
                        // Add backdrop filter for blur effect
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
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-8">
              <CircularProgress
                size={32}
                sx={{ color: 'var(--loader-color)' }}
                style={
                  { '--loader-color': 'rgb(79 70 229)' } as React.CSSProperties
                }
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                Loading documents...
              </span>
            </div>
          ) : error ? (
            <div className="col-span-full flex items-center justify-center py-8 text-red-500 dark:text-red-400">
              <span>{error}</span>
            </div>
          ) : userBlogs.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <span>No documents found for the selected criteria.</span>
            </div>
          ) : (
            userBlogs.map((blog) => (
              <div
                key={blog.id}
                className="dark:bg-mountain-800 border-mountain-200 dark:border-mountain-600 flex cursor-pointer flex-col items-center justify-center space-y-4 rounded-lg border bg-white pb-2 transition-colors duration-200 hover:border-indigo-600 dark:hover:border-indigo-400"
                onClick={() => handleDocumentClick(blog.id)}
              >
                {/* Document Thumbnail */}
                <div className="bg-mountain-50 dark:bg-mountain-700 border-mountain-50 dark:border-mountain-600 flex aspect-square w-full items-center justify-center overflow-hidden rounded-t-lg border">
                  <img
                    src={getThumbnail(blog)}
                    alt={blog.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.currentTarget.src = 'https://placehold.co/600x400';
                    }}
                  />
                </div>

                {/* Document Info */}
                <div className="flex w-full flex-col items-start justify-start space-y-2">
                  <p
                    className="dark:bg-mountain-800 text-mountain-800 dark:text-mountain-200 line-clamp-1 w-full bg-white px-2 text-left text-sm select-none"
                    title={blog.title}
                  >
                    {truncateTitle(blog.title)}
                  </p>
                  <div className="flex w-full items-center justify-between">
                    <p className="dark:bg-mountain-800 text-mountain-800 dark:text-mountain-300 w-full truncate bg-white px-2 text-left text-xs select-none">
                      {formatDate(blog.createdAt)}
                    </p>
                    <IconButton
                      onClick={(event) => handleMenuClick(event, blog.id)}
                      className="hover:bg-mountain-50 dark:bg-mountain-800 dark:hover:bg-mountain-700 text-mountain-600 dark:text-mountain-400 mr-2 h-6 w-6 cursor-pointer bg-white"
                      size="small"
                    >
                      <IoMdMore className="size-5" />
                    </IconButton>
                    <Menu
                      anchorEl={menuState.anchorEl}
                      open={
                        menuState.currentBlogId === blog.id &&
                        Boolean(menuState.anchorEl)
                      }
                      onClose={handleMenuClose}
                      onClick={(e) => e.stopPropagation()}
                      PaperProps={{
                        sx: {
                          backgroundColor: 'var(--menu-bg)',
                          color: 'var(--menu-text)',
                          border: '1px solid var(--menu-border)',
                          '& .MuiMenuItem-root': {
                            color: 'var(--menu-text)',
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
                      <MenuItem onClick={() => onEditMenuClick(blog.id)}>
                        Edit
                      </MenuItem>
                      <MenuItem onClick={() => onDeleteMenuClick(blog.id)}>
                        Delete
                      </MenuItem>
                    </Menu>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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
