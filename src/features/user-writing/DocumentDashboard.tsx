import { useUser } from '@/contexts/user';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Blog } from '@/types/blog';
import { IconButton, Menu } from '@mui/material';
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

type BlogSortOrder = 'latest' | 'oldest' | 'last7days' | 'last30days';

interface MenuState {
  anchorEl: null | HTMLElement;
  currentBlogId: null | number;
  anchorPosition?: { top: number; left: number };
  isRightClick?: boolean;
}

interface DeleteState {
  open: boolean;
  blogId: number | null;
  blogTitle: string | null;
}

const DEFAULT_THUMBNAIL = 'https://placehold.co/600x400';

const formatters = {
  date: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  },

  title: (title: string, maxLength: number = 30): string => {
    return title.length > maxLength
      ? `${title.substring(0, maxLength)}...`
      : title;
  },

  thumbnail: (blog: Blog): string => {
    return Array.isArray(blog.pictures) && blog.pictures[0]
      ? blog.pictures[0]
      : DEFAULT_THUMBNAIL;
  },
};

const sortOrderConfig = {
  latest: { sortBy: 'latest' as const, dateRange: 'all' as const },
  oldest: { sortBy: 'oldest' as const, dateRange: 'all' as const },
  last7days: { sortBy: 'latest' as const, dateRange: 'last7days' as const },
  last30days: { sortBy: 'latest' as const, dateRange: 'last30days' as const },
};

const LoadingSpinner = () => (
  <div className="loading-spinner-container">
    <div className="loading-spinner"></div>
    <span className="ml-2 text-gray-700 dark:text-gray-300">
      Loading documents...
    </span>
  </div>
);

const TemplateCard = React.memo(
  ({
    title,
    description,
    icon,
    onClick,
    ariaLabel,
  }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    ariaLabel: string;
  }) => (
    <div
      className="group flex cursor-pointer flex-col justify-center space-y-4"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      aria-label={ariaLabel}
    >
      <div className="template-card">
        <div className="template-icon-wrapper">{icon}</div>
      </div>
      <p className="text-mountain-800 dark:text-mountain-200 text-center text-sm font-medium">
        {title}
      </p>
      <p className="text-mountain-600 dark:text-mountain-400 text-center text-xs">
        {description}
      </p>
    </div>
  ),
);

TemplateCard.displayName = 'TemplateCard';

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
        if (menuState.anchorEl && menuState.currentBlogId === blog.id) return;
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
        e.currentTarget.src = DEFAULT_THUMBNAIL;
      },
      [],
    );

    return (
      <div
        className="blog-item-card"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="blog-thumbnail-container">
          <img
            src={formatters.thumbnail(blog)}
            alt={blog.title}
            className="h-full w-full object-cover"
            onError={handleImageError}
          />
        </div>

        <div className="blog-info-container">
          <p className="blog-title" title={blog.title}>
            {formatters.title(blog.title)}
          </p>
          <div className="blog-meta">
            <p className="blog-date">{formatters.date(blog.createdAt)}</p>
            <IconButton
              onClick={handleMenuClick}
              className="blog-menu-button"
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

const EmptyState = React.memo(
  ({
    message,
    onCreateDocument,
  }: {
    message: string;
    onCreateDocument: () => void;
  }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-12">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500">
          <IoBookOutline className="h-full w-full" />
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
          No documents found
        </h3>
        <p className="mb-6 text-gray-500 dark:text-gray-400">{message}</p>
        <button
          onClick={onCreateDocument}
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
        >
          <MdOutlineAdd className="mr-2 h-4 w-4" />
          Create Document
        </button>
      </div>
    </div>
  ),
);

EmptyState.displayName = 'EmptyState';

const DocumentDashboard = () => {
  const [order, setOrder] = useState<BlogSortOrder>('latest');
  const [userBlogs, setUserBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuState, setMenuState] = useState<MenuState>({
    anchorEl: null,
    currentBlogId: null,
  });
  const [deleteConfirmState, setDeleteConfirmState] = useState<DeleteState>({
    open: false,
    blogId: null,
    blogTitle: null,
  });

  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { user } = useUser();

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

  const handlers = useMemo(
    () => ({
      handleChange: (event: SelectChangeEvent) => {
        setOrder(event.target.value as BlogSortOrder);
      },

      handleCreateBlankDocument: () => navigate('/docs/new'),

      handleCreateTutorialDocument: () =>
        navigate('/docs/new?template=tutorial'),

      handleDocumentClick: (blogId: number) => {
        if (menuState.anchorEl && menuState.currentBlogId === blogId) {
          setMenuState({ anchorEl: null, currentBlogId: null });
          return;
        }
        navigate(`/docs/${blogId}`);
      },

      handleMenuClick: (
        event: React.MouseEvent<HTMLButtonElement>,
        blogId: number,
      ) => {
        event.stopPropagation();
        setMenuState({
          anchorEl: event.currentTarget,
          currentBlogId: blogId,
          anchorPosition: undefined,
          isRightClick: false,
        });
      },

      handleContextMenu: (
        event: React.MouseEvent<HTMLDivElement>,
        blogId: number,
      ) => {
        event.preventDefault();
        event.stopPropagation();
        setMenuState({
          anchorEl: null,
          currentBlogId: blogId,
          anchorPosition: { top: event.clientY, left: event.clientX },
          isRightClick: true,
        });
      },

      handleMenuClose: () => {
        setMenuState({ anchorEl: null, currentBlogId: null });
      },

      handleEditMenuClick: (blogId: number) => {
        setMenuState({ anchorEl: null, currentBlogId: null });
        navigate(`/docs/${blogId}`);
      },

      handleDeleteMenuClick: (blogId: number) => {
        setMenuState({ anchorEl: null, currentBlogId: null });
        const blog = userBlogs.find((b) => b.id === blogId);
        setDeleteConfirmState({
          open: true,
          blogId,
          blogTitle: blog?.title || null,
        });
      },

      handleConfirmDelete: () => {
        if (deleteConfirmState.blogId) {
          deleteBlogMutation(deleteConfirmState.blogId);
        }
      },

      handleCancelDelete: () => {
        setDeleteConfirmState({ open: false, blogId: null, blogTitle: null });
      },
    }),
    [navigate, menuState, userBlogs, deleteConfirmState, deleteBlogMutation],
  );

  const memoizedValues = useMemo(
    () => ({
      documentCountText: `${userBlogs.length} ${userBlogs.length === 1 ? 'document' : 'documents'}`,
      emptyStateMessage:
        order === 'latest'
          ? 'Get started by creating your first document.'
          : 'No documents found for the selected criteria.',
    }),
    [userBlogs.length, order],
  );

  useEffect(() => {
    const fetchUserDocuments = async () => {
      if (!user?.username) {
        setIsLoading(false);
        return;
      }

      const config = sortOrderConfig[order];
      const params: BlogQueryParams = {
        take: 100,
        skip: 0,
        sortField: 'updatedAt',
        sortBy: config.sortBy,
        dateRange: config.dateRange,
      };

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

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error)
      return (
        <div className="col-span-full flex items-center justify-center py-8 text-red-500 dark:text-red-400">
          {error}
        </div>
      );
    if (userBlogs.length === 0)
      return (
        <EmptyState
          message={memoizedValues.emptyStateMessage}
          onCreateDocument={handlers.handleCreateBlankDocument}
        />
      );

    return userBlogs.map((blog) => (
      <BlogItem
        key={blog.id}
        blog={blog}
        onDocumentClick={handlers.handleDocumentClick}
        onMenuClick={handlers.handleMenuClick}
        onContextMenu={handlers.handleContextMenu}
        menuState={menuState}
      />
    ));
  };

  return (
    <div className="custom-scrollbar flex h-screen flex-col items-center overflow-auto rounded-t-3xl">
      <div className="border-mountain-50 dark:border-mountain-700 dark:bg-mountain-900 flex h-fit w-full justify-center bg-white">
        <div className="flex h-full w-fit flex-col items-center justify-center space-y-2 p-4">
          <div className="flex h-full space-x-4">
            <TemplateCard
              title="Blank Document"
              description="Start typing to create"
              icon={
                <MdOutlineAdd className="size-10 text-gray-800 dark:text-gray-200" />
              }
              onClick={handlers.handleCreateBlankDocument}
              ariaLabel="Create Blank Document"
            />
            <TemplateCard
              title="Tutorial Template"
              description="Pre-formatted structure"
              icon={
                <IoBookOutline className="size-10 text-gray-800 dark:text-gray-200" />
              }
              onClick={handlers.handleCreateTutorialDocument}
              ariaLabel="Create Tutorial Document"
            />
          </div>
        </div>
      </div>

      <div className="border-mountain-200 dark:border-mountain-700 flex w-full flex-col space-y-6 border-t">
        <div className="dark:bg-mountain-800 sticky top-0 flex h-fit w-full items-center justify-between bg-white px-4 py-3 shadow-md">
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Recent projects
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {memoizedValues.documentCountText}
            </p>
          </div>
          <div className="flex items-center">
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select
                value={order}
                onChange={handlers.handleChange}
                displayEmpty
                inputProps={{ 'aria-label': 'Order By' }}
                className="custom-select"
              >
                <MenuItem value="latest">Latest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
                <MenuItem value="last7days">Last 7 days</MenuItem>
                <MenuItem value="last30days">Last 30 days</MenuItem>
              </Select>
              <IoFilter className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-600 dark:text-gray-400" />
            </FormControl>
          </div>
        </div>

        <div className="grid min-h-[calc(100vh-4rem)] grid-cols-2 items-start gap-6 p-6 pb-96 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {renderContent()}
        </div>
      </div>

      <Menu
        anchorEl={menuState.anchorEl}
        open={Boolean(menuState.anchorEl) || Boolean(menuState.anchorPosition)}
        onClose={handlers.handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        anchorPosition={menuState.anchorPosition}
        anchorReference={menuState.isRightClick ? 'anchorPosition' : 'anchorEl'}
        className="custom-menu"
      >
        <MenuItem
          onClick={() =>
            menuState.currentBlogId &&
            handlers.handleEditMenuClick(menuState.currentBlogId)
          }
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() =>
            menuState.currentBlogId &&
            handlers.handleDeleteMenuClick(menuState.currentBlogId)
          }
        >
          Delete
        </MenuItem>
      </Menu>

      <BlogDeleteConfirmDialog
        open={deleteConfirmState.open}
        onClose={handlers.handleCancelDelete}
        onConfirm={handlers.handleConfirmDelete}
        submitting={isDeletingBlog}
        blogTitle={deleteConfirmState.blogTitle || undefined}
      />

      <style>{`
        .loading-spinner-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 0;
          grid-column: 1 / -1;
        }
        
        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          will-change: transform;
        }
        
        .template-card {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 12rem;
          width: 10.5rem;
          background: rgb(249 250 251);
          border: 1px solid white;
          transition: all 0.2s ease;
        }
        
        .template-card:hover {
          transform: scale(1.05);
          border-color: #6366f1;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .dark .template-card {
          background: rgb(41 37 36);
          border-color: rgb(87 83 78);
        }
        
        .dark .template-card:hover {
          border-color: #818cf8;
        }
        
        .template-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 100%);
          transition: transform 0.2s ease;
        }
        
        .group:hover .template-icon-wrapper {
          transform: scale(1.1);
        }
        
        .dark .template-icon-wrapper {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        }
        
        .blog-item-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          space-y: 1rem;
          padding-bottom: 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .blog-item-card:hover {
          transform: scale(1.05);
          border-color: #6366f1;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .dark .blog-item-card {
          background: rgb(41 37 36);
          border-color: rgb(87 83 78);
        }
        
        .dark .blog-item-card:hover {
          border-color: #818cf8;
        }
        
        .blog-thumbnail-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
          border-radius: 0.5rem 0.5rem 0 0;
          background: rgb(249 250 251);
          border: 1px solid rgb(249 250 251);
        }
        
        .dark .blog-thumbnail-container {
          background: rgb(68 64 60);
          border-color: rgb(87 83 78);
        }
        
        .blog-info-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          width: 100%;
          gap: 0.5rem;
        }
        
        .blog-title {
          width: 100%;
          padding: 0 0.5rem;
          text-align: left;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgb(41 37 36);
          background: white;
          user-select: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .dark .blog-title {
          color: rgb(231 229 228);
          background: rgb(41 37 36);
        }
        
        .blog-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        
        .blog-date {
          width: 100%;
          padding: 0 0.5rem;
          text-align: left;
          font-size: 0.75rem;
          color: rgb(120 113 108);
          background: white;
          user-select: none;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .dark .blog-date {
          color: rgb(168 162 158);
          background: rgb(41 37 36);
        }
        
        .blog-menu-button {
          margin-right: 0.5rem;
          width: 1.5rem;
          height: 1.5rem;
          background: white;
          color: rgb(120 113 108);
          cursor: pointer;
        }
        
        .blog-menu-button:hover {
          background: rgb(249 250 251);
        }
        
        .dark .blog-menu-button {
          background: rgb(41 37 36);
          color: rgb(168 162 158);
        }
        
        .dark .blog-menu-button:hover {
          background: rgb(68 64 60);
        }
        
        .custom-select {
          position: relative;
          height: 2.5rem;
          width: 9rem;
          border-radius: 9999px;
          padding-left: 2rem;
          background: rgba(255, 255, 255, 0.98);
          color: #374151;
        }
        
        .custom-select .MuiOutlinedInput-notchedOutline {
          border-color: #d1d5db;
        }
        
        .custom-select:hover .MuiOutlinedInput-notchedOutline {
          border-color: #9ca3af;
        }
        
        .custom-select.Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: #6366f1;
        }
        
        .custom-select .MuiSelect-icon {
          color: #374151;
        }
        
        .custom-menu .MuiPaper-root {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          min-width: 120px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
        }
        
        .custom-menu .MuiMenuItem-root {
          color: #374151;
          font-size: 0.875rem;
          padding: 8px 16px;
        }
        
        .custom-menu .MuiMenuItem-root:hover {
          background: #f3f4f6;
        }
        
        .dark .custom-select {
          background: rgb(41 37 36);
          color: rgb(229 231 235);
        }
        
        .dark .custom-select .MuiOutlinedInput-notchedOutline {
          border-color: rgb(87 83 78);
        }
        
        .dark .custom-select:hover .MuiOutlinedInput-notchedOutline {
          border-color: rgb(120 113 108);
        }
        
        .dark .custom-select.Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: rgb(129 140 248);
        }
        
        .dark .custom-select .MuiSelect-icon {
          color: rgb(229 231 235);
        }
        
        .dark .custom-menu .MuiPaper-root {
          background: rgb(41 37 36);
          color: rgb(229 231 235);
          border-color: rgb(87 83 78);
        }
        
        .dark .custom-menu .MuiMenuItem-root {
          color: rgb(229 231 235);
        }
        
        .dark .custom-menu .MuiMenuItem-root:hover {
          background: rgb(68 64 60);
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DocumentDashboard;
