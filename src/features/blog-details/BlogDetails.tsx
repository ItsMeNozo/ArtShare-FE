import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

//Components
import type { Blog } from '@/types/blog';
import { Button, CircularProgress, IconButton, Tooltip } from '@mui/material';
import Avatar from 'boring-avatars';
//Icons
import { LikesDialog } from '@/components/like/LikesDialog';
import { useUser } from '@/contexts/user';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useSnackbar } from '@/hooks/useSnackbar';
import { TargetType } from '@/utils/constants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { AiFillLike, AiOutlineLike } from 'react-icons/ai';
import { BiComment } from 'react-icons/bi';
import { FiTrash2 } from 'react-icons/fi';
import { IoPersonAddOutline } from 'react-icons/io5';
import { LuLink, LuPencil } from 'react-icons/lu';
import { MdOutlineFlag } from 'react-icons/md'; // Report Icon
import { fetchBlogComments } from '../post/api/comment.api';
import CommentSection, {
  CommentSectionRef,
} from '../post/components/CommentSection';
import {
  followUser,
  unfollowUser,
} from '../user-profile-public/api/follow.api';
import { fetchBlogDetails } from './api/blog';
import { createLike, removeLike } from './api/like-blog';
import RelatedBlogs from './components/RelatedBlogs';

// Import your ReportDialog and the reporting hook
import { ReportTargetType } from '../user-profile-public/api/report.api';
import ReportDialog from '../user-profile-public/components/ReportDialog';
import { useReport } from '../user-profile-public/hooks/useReport';
import { BlogDeleteConfirmDialog } from '../user-writing/components/BlogDeleteConfirmDialog';
import { useDeleteBlog } from '../user-writing/hooks/useDeleteBlog';

import './BlogDetails.css';
interface BlogError {
  message: string;
  error?: string;
  statusCode?: number;
}

const BlogDetails = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const [showAuthorBadge, setShowAuthorBadge] = useState(false);
  const [likesDialogOpen, setLikesDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false); // Add delete confirmation state
  const { user } = useUser();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const requireAuth = useRequireAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const {
    data: blog,
    isLoading,
    error,
    refetch,
  } = useQuery<Blog, AxiosError<BlogError>>({
    queryKey: ['blogDetails', blogId],
    queryFn: () => fetchBlogDetails(Number(blogId)),
    enabled: !!blogId,
    retry: (failureCount, error) => {
      // Don't retry on 403 or 404 errors
      if (error?.response?.status === 403 || error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
  const navigate = useNavigate();
  const commentSectionRef = useRef<CommentSectionRef>(null);

  // Delete blog mutation
  const { mutate: deleteBlogMutation, isPending: isDeletingBlog } =
    useDeleteBlog({
      onSuccess: () => {
        navigate('/blogs');
        showSnackbar('Blog deleted successfully!', 'success');
      },
      onError: (errorMessage) => {
        showSnackbar(errorMessage, 'error');
      },
    });

  // Reporting Hook
  const { mutate: reportBlogContent, isPending: isLoadingReport } = useReport();

  const {
    data: comments = [],
    isLoading: commentsLoading,
    error: commentsError,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ['blogComments', blogId],
    queryFn: () => fetchBlogComments(Number(blogId)),
    enabled: !!blogId,
  });

  const followMutation = useMutation({
    mutationFn: () => followUser(blog!.user.id),
    onSuccess: () => refetch(),
    onError: (error: unknown) => {
      const msg =
        error instanceof AxiosError && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to follow user.';
      showSnackbar(msg, 'error');
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(blog!.user.id),
    onSuccess: () => refetch(),
    onError: (error: unknown) => {
      const msg =
        error instanceof AxiosError && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to unfollow user.';
      showSnackbar(msg, 'error');
    },
  });

  const likeMutation = useMutation({
    mutationFn: () =>
      createLike({
        targetId: Number(blogId),
        targetType: TargetType.BLOG,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['blogDetails', blogId] }),
    onError: (error: unknown) => {
      const msg =
        error instanceof AxiosError && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to like blog.';
      showSnackbar(msg, 'error');
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () =>
      removeLike({
        targetId: Number(blogId),
        targetType: TargetType.BLOG,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['blogDetails', blogId] }),
    onError: (error: unknown) => {
      const msg =
        error instanceof AxiosError && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to unlike blog.';
      showSnackbar(msg, 'error');
    },
  });

  const isOwnBlog = user?.id === blog?.user.id;
  const isFollowing = blog?.user.isFollowing;
  const isPublished = blog?.isPublished ?? true;

  const toggleFollow = () =>
    requireAuth('follow/unfollow users', () =>
      isFollowing ? unfollowMutation.mutate() : followMutation.mutate(),
    );

  const followBtnLoading =
    followMutation.isPending || unfollowMutation.isPending;
  const isLiked = blog?.isLikedByCurrentUser || false;
  const likeCount = blog?.likeCount || 0;

  const handleToggleLike = () =>
    requireAuth('like this blog', () => {
      isLiked ? unlikeMutation.mutate() : likeMutation.mutate();
    });

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollY = scrollContainerRef.current.scrollTop; // scrollTop is correct for an element
        setShowAuthorBadge(scrollY > 150);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleOpenLikesDialog = () =>
    requireAuth('view likes', () => setLikesDialogOpen(true));
  const handleCloseLikesDialog = () => setLikesDialogOpen(false);

  // Report dialog handlers
  const handleOpenReportDialog = () => {
    if (!user) {
      showSnackbar(
        'Please login to report this blog',
        'warning',
        <Button
          size="small"
          color="inherit"
          onClick={() => (window.location.href = '/login')}
        >
          Login
        </Button>,
      );
      return;
    }
    if (isOwnBlog) {
      showSnackbar('You cannot report your own blog.', 'info');
      return;
    }
    setReportDialogOpen(true);
  };
  const handleCloseReportDialog = () => setReportDialogOpen(false);

  // Delete blog handlers
  const handleOpenDeleteDialog = () => {
    setDeleteConfirmOpen(true);
  };
  const handleCloseDeleteDialog = () => setDeleteConfirmOpen(false);
  const handleConfirmDelete = () => {
    if (blog) {
      deleteBlogMutation(blog.id);
      setDeleteConfirmOpen(false);
    }
  };

  const handleReportSubmit = (reason: string) => {
    if (!blog) return;

    reportBlogContent(
      {
        targetId: blog.id,
        targetType: ReportTargetType.BLOG,
        reason: reason,
        targetTitle: blog.title,
      },
      {
        onSuccess: () => {
          setReportDialogOpen(false);
          showSnackbar(
            'Blog reported successfully. Thank you for your feedback.',
            'success',
          );
        },
        onError: (err: Error) => {
          showSnackbar(
            `Failed to report blog: ${err.message || 'Unknown error'}`,
            'error',
          );
        },
      },
    );
  };

  const handleCommentAdded = () => {
    refetchComments();
    queryClient.invalidateQueries({ queryKey: ['blogDetails', blogId] });
  };
  const handleCommentDeleted = () => {
    refetchComments();
    queryClient.invalidateQueries({ queryKey: ['blogDetails', blogId] });
  };

  // Handle loading state
  if (isLoading || commentsLoading)
    return (
      <div className="dark:bg-mountain-950 flex h-screen items-center justify-center space-x-4 bg-white text-black dark:text-white">
        <CircularProgress size={36} /> <p>Loading…</p>
      </div>
    );

  // Handle error states with specific messages
  if (error) {
    const errorData = error.response?.data;
    const statusCode = error.response?.status;

    // Handle specific error cases
    if (statusCode === 403) {
      return (
        <div className="dark:bg-mountain-950 flex h-screen flex-col items-center justify-center bg-white p-8">
          <div className="max-w-md text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-20 w-20 text-yellow-500 dark:text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Access Restricted
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {errorData?.message || 'This blog is not accessible.'}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/blogs')}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                Browse Other Blogs
              </Button>
              {user && (
                <Button
                  onClick={() => navigate('/docs/new')}
                  variant="outlined"
                  className="w-full"
                >
                  Create Your Own Blog
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (statusCode === 404) {
      return (
        <div className="dark:bg-mountain-950 flex h-screen flex-col items-center justify-center bg-white p-8">
          <div className="max-w-md text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-20 w-20 text-gray-400 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Blog Not Found
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {errorData?.message ||
                "The blog you're looking for doesn't exist."}
            </p>
            <Button
              onClick={() => navigate('/blogs')}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Back to Blogs
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="dark:bg-mountain-950 flex h-screen flex-col items-center justify-center bg-white p-8">
        <div className="max-w-md text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-20 w-20 text-red-500 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Something went wrong
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {errorData?.message || error.message || 'Failed to load the blog.'}
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => refetch()}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Try Again
            </Button>
            <Button
              onClick={() => navigate('/blogs')}
              variant="outlined"
              className="w-full"
            >
              Back to Blogs
            </Button>
          </div>
        </div>
      </div>
    );
  }
  // Handle comments error
  if (commentsError) {
    console.error('Failed to load comments:', commentsError);
    // Continue showing the blog even if comments fail to load
  }

  // If no blog data after loading
  if (!blog) {
    return (
      <div className="dark:bg-mountain-950 flex h-screen items-center justify-center bg-white">
        <p className="text-gray-600 dark:text-gray-400">
          No blog data available.
        </p>
      </div>
    );
  }

  const readingTime = Math.ceil(blog.content.split(/\s+/).length / 200);

  // Centralized Action Buttons Component with improved visibility
  const ActionButtons = () => (
    <div className="dark:bg-mountain-900 border-mountain-200 dark:border-mountain-700 flex h-full w-full items-center space-x-3 rounded-full border bg-white p-2 shadow-sm transition duration-300 ease-in-out">
      <Tooltip title={isLiked ? 'Unlike' : 'Like'} placement="bottom" arrow>
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 p-2 font-medium text-blue-700 shadow-md transition-all duration-200 hover:cursor-pointer hover:bg-blue-200 hover:text-blue-800 dark:bg-blue-800/40 dark:text-blue-300 dark:hover:bg-blue-700/60 dark:hover:text-blue-200"
          onClick={handleToggleLike}
          aria-disabled={likeMutation.isPending || unlikeMutation.isPending}
        >
          {isLiked ? (
            <AiFillLike className="size-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <AiOutlineLike className="size-5 text-blue-600 dark:text-blue-400" />
          )}
          <p
            className="ml-1 font-medium text-blue-700 hover:underline dark:text-blue-300"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenLikesDialog();
            }}
          >
            {likeCount}
          </p>
        </div>
      </Tooltip>
      <Tooltip title="Comment" placement="bottom" arrow>
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 p-2 font-medium text-green-700 shadow-md transition-all duration-200 hover:cursor-pointer hover:bg-green-200 hover:text-green-800 dark:bg-green-800/40 dark:text-green-300 dark:hover:bg-green-700/60 dark:hover:text-green-200"
          onClick={() => commentSectionRef.current?.focusCommentInput()}
        >
          <BiComment className="mr-1 size-4 text-green-600 dark:text-green-400" />
          <span className="font-medium text-green-700 dark:text-green-300">
            {blog.commentCount}
          </span>
        </div>
      </Tooltip>
      <div className="ml-auto flex items-center space-x-3">
        <Tooltip title={copied ? 'Link copied!' : 'Copy link'} arrow>
          <IconButton
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-mountain-700 dark:text-mountain-200 hover:text-mountain-900 bg-mountain-100 dark:bg-mountain-700 hover:bg-mountain-200 dark:hover:bg-mountain-600 flex h-12 w-12 items-center justify-center rounded-full p-2 font-medium shadow-md transition-all duration-200 hover:cursor-pointer dark:hover:text-white"
          >
            <LuLink className="size-4" />
          </IconButton>
        </Tooltip>
        {/* Report Button - Conditionally rendered */}
        {!isOwnBlog && (
          <Tooltip title="Report this blog" arrow>
            <IconButton
              onClick={handleOpenReportDialog}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 p-2 font-medium text-red-600 shadow-md transition-all duration-200 hover:cursor-pointer hover:bg-red-100 hover:text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/40 dark:hover:text-red-300"
            >
              <MdOutlineFlag className="size-4" />
            </IconButton>
          </Tooltip>
        )}
        {isOwnBlog && (
          <>
            <Tooltip title="Edit" arrow>
              <IconButton
                onClick={() => navigate(`/docs/${blog.id}`)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 p-2 font-medium text-purple-600 shadow-md transition-all duration-200 hover:cursor-pointer hover:bg-purple-100 hover:text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-800/40 dark:hover:text-purple-300"
              >
                <LuPencil className="size-4" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete" arrow>
              <IconButton
                onClick={handleOpenDeleteDialog}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 p-2 font-medium text-red-600 shadow-md transition-all duration-200 hover:cursor-pointer hover:bg-red-100 hover:text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/40 dark:hover:text-red-300"
              >
                <FiTrash2 className="size-4" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div
      ref={scrollContainerRef}
      className="sidebar dark:bg-mountain-950 h-screen w-full overflow-y-auto bg-white"
    >
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="group flex flex-col space-y-8">
          <div className="flex w-full space-x-2">
            <Link
              to="/blogs"
              className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Blogs
            </Link>
            <span className="text-mountain-600 dark:text-mountain-400">/</span>
            <span className="text-mountain-600 dark:text-mountain-400 line-clamp-1">
              {blog.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-medium text-black dark:text-white">
              {blog.title}
            </h1>
            {/* Show draft badge if not published and user is the owner */}
            {!isPublished && isOwnBlog && (
              <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                Draft
              </span>
            )}
          </div>

          <div className="text-mountain-600 dark:text-mountain-400 flex items-center space-x-2 text-sm">
            {isPublished ? (
              <>
                <p>
                  Published{' '}
                  {formatDistanceToNow(new Date(blog.createdAt), {
                    addSuffix: true,
                  })}
                </p>
                <span>•</span>
                <p>{readingTime}m reading</p>
              </>
            ) : (
              <>
                <p className="text-yellow-600 dark:text-yellow-400">
                  Not published yet
                </p>
                <span>•</span>
                <p>
                  Created{' '}
                  {formatDistanceToNow(new Date(blog.createdAt), {
                    addSuffix: true,
                  })}
                </p>
                <span>•</span>
                <p>{readingTime}m reading</p>
              </>
            )}
          </div>

          {/* Show a banner for unpublished content if owner */}
          {!isPublished && isOwnBlog && (
            <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
              <div className="flex items-start">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    This blog is not published yet
                  </p>
                  <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                    Only you can see this content. Click the "Publish" button in
                    the editor to make it public.
                  </p>
                  <Button
                    onClick={() => navigate(`/docs/${blog.id}`)}
                    className="mt-3 bg-yellow-600 text-sm text-white hover:bg-yellow-700"
                  >
                    Continue Editing
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* For unpublished blogs, hide or disable certain actions */}
          {isPublished && (
            <div
              className={`flex h-20 w-full items-center justify-center transition-all duration-300 ease-in-out ${showAuthorBadge ? 'sticky bottom-4 z-10' : 'opacity-100'}`}
            >
              <ActionButtons />
            </div>
          )}

          {/* Author Info Box */}
          <div className="dark:border-mountain-700 flex items-center justify-between rounded-lg border border-transparent bg-gradient-to-r from-indigo-100 to-purple-100 p-4 shadow-sm dark:from-indigo-900/30 dark:to-purple-900/30">
            <div className="flex items-center space-x-4">
              {blog.user.profilePictureUrl ? (
                <img
                  src={blog.user.profilePictureUrl}
                  alt={blog.user.username}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <Avatar
                  name={blog.user.username}
                  size={48}
                  variant="beam"
                  colors={['#84bfc3', '#ff9b62', '#d96153']}
                />
              )}
              <div className="flex flex-col">
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {blog.user.fullName}
                </p>
                <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                  <span>@{blog.user.username}</span>
                  <span className="text-gray-400 dark:text-gray-500">•</span>
                  <span>
                    {blog.user.followersCount.toLocaleString()}{' '}
                    {blog.user.followersCount <= 1 ? 'follower' : 'followers'}
                  </span>
                </div>
              </div>
            </div>
            {!isOwnBlog && (
              <Button
                onClick={toggleFollow}
                disabled={followBtnLoading}
                className="dark:bg-mountain-800 hover:bg-mountain-50 dark:hover:bg-mountain-700 border-mountain-200 dark:border-mountain-600 flex h-10 w-32 items-center border bg-white text-sm font-medium text-black shadow dark:text-white"
              >
                <IoPersonAddOutline className="mr-2 text-blue-500 dark:text-blue-400" />
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>

          {/* Blog Content */}
          <div
            className="prose lg:prose-xl dark:prose-invert reset-tailwind dark:bg-mountain-950 max-w-none rounded-md bg-white p-2 text-black dark:text-white"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          <hr className="border-mountain-200 dark:border-mountain-700 flex w-full border-t-1" />

          {/* Only show action bar and interactions for published blogs */}
          {isPublished ? (
            <>
              <div
                className={`${showAuthorBadge ? 'opacity-100' : 'pointer-events-none opacity-0'} flex h-20 w-full items-center justify-center rounded-full transition duration-300 ease-in-out`}
              >
                <ActionButtons />
              </div>

              <RelatedBlogs currentBlogId={Number(blogId)} />
              <hr className="border-mountain-200 dark:border-mountain-700 flex w-full border-t-1" />

              <CommentSection
                ref={commentSectionRef}
                inputPosition="top"
                comments={comments}
                targetId={Number(blogId)}
                targetType={TargetType.BLOG}
                onCommentAdded={handleCommentAdded}
                onCommentDeleted={handleCommentDeleted}
                hideWrapper
              />
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <svg
                  className="h-8 w-8 text-gray-400 dark:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="mb-2 text-lg font-medium text-gray-500 dark:text-gray-400">
                Comments are disabled for drafts
              </p>
              <p className="text-gray-400 dark:text-gray-500">
                Publish your blog to enable comments and interactions.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Only show likes dialog for published blogs */}
      {isPublished && (
        <LikesDialog
          contentId={Number(blogId)}
          open={likesDialogOpen}
          onClose={handleCloseLikesDialog}
          variant={TargetType.BLOG}
        />
      )}

      {/* Report Dialog - only for published blogs */}
      {blog && isPublished && (
        <ReportDialog
          open={reportDialogOpen}
          onClose={handleCloseReportDialog}
          onSubmit={handleReportSubmit}
          submitting={isLoadingReport}
          itemName={blog.title}
          itemType="blog"
        />
      )}

      {/* Delete Confirmation Dialog - only for blog owners */}
      {blog && isOwnBlog && (
        <BlogDeleteConfirmDialog
          open={deleteConfirmOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          submitting={isDeletingBlog}
          blogTitle={blog.title}
        />
      )}
    </div>
  );
};

export default BlogDetails;
