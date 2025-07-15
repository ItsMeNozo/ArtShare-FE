import {
  Notification,
  NotificationPayload,
  PostNotificationPayload,
  useNotifications,
} from '@/contexts/NotificationsContext';
import TokenPopover from '@/features/gen-art/components/TokenPopover';
import { formatDaysAgo } from '@/lib/utils';
import { User } from '@/types';
import { Button } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { BsPen } from 'react-icons/bs';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from 'react-icons/fa';
import { FaBell } from 'react-icons/fa6';
import { FiLogIn } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PurchaseButton from '../buttons/PurchaseButton';
import { Skeleton } from '../ui/skeleton';

// Enhanced highlighting functions to overcome MUI theme conflicts
const enhancedHighlightComment = (element: HTMLElement) => {
  // Store original styles
  const originalStyles = {
    backgroundColor: element.style.backgroundColor,
    borderLeft: element.style.borderLeft,
    borderRadius: element.style.borderRadius,
    transition: element.style.transition,
    boxShadow: element.style.boxShadow,
    animation: element.style.animation,
  };

  // Store original styles in a data attribute for restoration
  element.setAttribute('data-original-styles', JSON.stringify(originalStyles));

  // Add CSS class first (for browsers where CSS works)
  element.classList.add('highlight-comment');

  // Apply direct styles as backup (to override MUI theme conflicts)
  const isDarkMode =
    document.documentElement.classList.contains('dark') ||
    document.body.classList.contains('dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (isDarkMode) {
    // Dark mode styles
    element.style.backgroundColor = 'rgba(99, 102, 241, 0.25)';
    element.style.borderLeft = '4px solid rgb(129, 140, 248)';
    element.style.boxShadow = '0 0 0 1px rgba(129, 140, 248, 0.2)';
  } else {
    // Light mode styles
    element.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
    element.style.borderLeft = '4px solid rgb(99, 102, 241)';
    element.style.boxShadow = '0 0 0 1px rgba(99, 102, 241, 0.1)';
  }

  // Common styles
  element.style.borderRadius = '0.5rem';
  element.style.transition = 'all 0.3s ease-in-out';

  // Add pulse animation using JavaScript
  element.style.animation = 'highlight-pulse 0.6s ease-in-out';

  console.log('[UserButton] Enhanced highlighting applied to element:', {
    id: element.id,
    appliedStyles: {
      backgroundColor: element.style.backgroundColor,
      borderLeft: element.style.borderLeft,
      borderRadius: element.style.borderRadius,
      boxShadow: element.style.boxShadow,
    },
    isDarkMode,
  });
};

const removeEnhancedHighlight = (element: HTMLElement) => {
  // Remove CSS class
  element.classList.remove('highlight-comment');

  // Restore original styles
  try {
    const originalStylesStr = element.getAttribute('data-original-styles');
    if (originalStylesStr) {
      const originalStyles = JSON.parse(originalStylesStr);

      // Restore each style property using setProperty
      Object.keys(originalStyles).forEach((property) => {
        const value = originalStyles[property];
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        if (value) {
          element.style.setProperty(cssProperty, value);
        } else {
          element.style.removeProperty(cssProperty);
        }
      });

      // Remove the data attribute
      element.removeAttribute('data-original-styles');
    } else {
      // Fallback: reset to empty strings if no original styles stored
      element.style.backgroundColor = '';
      element.style.borderLeft = '';
      element.style.borderRadius = '';
      element.style.transition = '';
      element.style.boxShadow = '';
      element.style.animation = '';
    }
  } catch (error) {
    console.warn('[UserButton] Error restoring original styles:', error);
    // Fallback: reset to empty strings
    element.style.backgroundColor = '';
    element.style.borderLeft = '';
    element.style.borderRadius = '';
    element.style.transition = '';
    element.style.boxShadow = '';
    element.style.animation = '';
  }

  console.log(
    '[UserButton] Enhanced highlighting removed from element:',
    element.id,
  );
};

// Helper function to format notification messages with enhanced content
const formatNotificationMessage = (
  notif: Notification<NotificationPayload>,
) => {
  const message = notif?.payload?.message || '';

  // Enhanced message formatting with post names
  if (
    message.includes('liked your artwork') ||
    message.includes('liked your post')
  ) {
    // Try to extract post title if available in the message
    const parts = message.split(/ liked your (?:artwork|post)/);
    if (parts.length > 0 && parts[0]) {
      const userName = parts[0].trim().replace(/^"|"$/g, ''); // Remove quotes if present

      // Check if we have post title in payload
      const postPayload = notif.payload as PostNotificationPayload;
      if (postPayload?.postTitle) {
        return (
          <>
            <span className="font-bold">{userName}</span> liked your post:{' '}
            <span className="font-semibold">{postPayload.postTitle}</span>
          </>
        );
      }

      return (
        <>
          <span className="font-bold">{userName}</span> liked your post
        </>
      );
    }
  }

  if (
    message.includes('commented on your artwork') ||
    message.includes('commented on your post')
  ) {
    const parts = message.split(/ commented on your (?:artwork|post)/);
    if (parts.length > 0 && parts[0]) {
      const userName = parts[0].trim().replace(/^"|"$/g, '');

      // Check if we have post title in payload
      const postPayload = notif.payload as PostNotificationPayload;
      if (postPayload?.postTitle) {
        return (
          <>
            <span className="font-bold">{userName}</span> commented on your
            post: <span className="font-semibold">{postPayload.postTitle}</span>
          </>
        );
      }

      return (
        <>
          <span className="font-bold">{userName}</span> commented on your post
        </>
      );
    }
  }

  // Handle the new backend template format: "username published new post: "title""
  if (message.includes('published new post:')) {
    const publishPattern =
      /^([^.\s]+(?:\s+[^.\s]+)*?)\s+published new post:\s*"?([^"]+)"?$/i;
    const publishMatch = message.match(publishPattern);

    if (publishMatch && publishMatch[1] && publishMatch[2]) {
      const userName = publishMatch[1].trim();
      const postTitle = publishMatch[2].trim();
      return (
        <>
          <span className="font-bold">{userName}</span> published new post:{' '}
          <span className="font-semibold">{postTitle}</span>
        </>
      );
    }
  }

  // Handle legacy formats or when post title is in payload
  if (
    message.includes('published new artwork') ||
    message.includes('published a new post')
  ) {
    // Handle the "published new post" format with post title
    const postPayload = notif.payload as PostNotificationPayload;

    // Extract username from message
    const publishPattern =
      /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+(?:published new artwork|published a new post))/i;
    const publishMatch = message.match(publishPattern);

    if (publishMatch && publishMatch[1]) {
      const userName = publishMatch[1].trim().replace(/^"|"$/g, '');

      // Always show with post title if available, otherwise use generic format
      if (postPayload?.postTitle) {
        return (
          <>
            <span className="font-bold">{userName}</span> published new post:{' '}
            <span className="font-semibold">{postPayload.postTitle}</span>
          </>
        );
      }

      return (
        <>
          <span className="font-bold">{userName}</span> published a new post
        </>
      );
    }
  }

  // Check if the message already contains "published new post:" format
  if (message.includes('published new post:')) {
    const parts = message.split(' published new post:');
    if (parts.length >= 2 && parts[0] && parts[1]) {
      const userName = parts[0].trim().replace(/^"|"$/g, '');
      const postTitle = parts[1].trim();
      return (
        <>
          <span className="font-bold">{userName}</span> published new post:{' '}
          <span className="font-semibold">{postTitle}</span>
        </>
      );
    }
  }

  // For other notification types, use the bold name formatting
  return formatMessageWithBoldNames(message);
};

// Helper function to make names bold in notification messages
const formatMessageWithBoldNames = (message: string) => {
  // Enhanced implementation to handle various notification patterns

  // Pattern for report notifications: "Your report regarding "Name" has been reviewed and resolved"
  const reportPattern =
    /^Your report regarding\s*[""']([^""']+)[""']\s*(has been\s*.+)$/i;
  const reportMatch = message.match(reportPattern);
  if (reportMatch) {
    const reportedName = reportMatch[1].trim();
    const restOfMessage = reportMatch[2].trim();
    return (
      <>
        Your report regarding <span className="font-bold">{reportedName}</span>{' '}
        {restOfMessage}
      </>
    );
  }

  // Pattern 1: "UserName started following you"
  const followingPattern =
    /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+started following you)/i;
  const followingMatch = message.match(followingPattern);
  if (followingMatch) {
    const userName = followingMatch[1].trim().replace(/^"|"$/g, ''); // Remove quotes
    const action = message.substring(userName.length);
    return (
      <>
        <span className="font-bold">{userName}</span>
        {action}
      </>
    );
  }

  // Pattern 2: "UserName followed you"
  const followedPattern = /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+followed you)/i;
  const followedMatch = message.match(followedPattern);
  if (followedMatch) {
    const userName = followedMatch[1].trim().replace(/^"|"$/g, ''); // Remove quotes
    const action = message.substring(userName.length);
    return (
      <>
        <span className="font-bold">{userName}</span>
        {action}
      </>
    );
  }

  // Pattern 3: "UserName replied to your comment"
  const replyPattern =
    /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+replied to your comment)/i;
  const replyMatch = message.match(replyPattern);
  if (replyMatch) {
    const userName = replyMatch[1].trim().replace(/^"|"$/g, ''); // Remove quotes
    const action = message.substring(userName.length);
    return (
      <>
        <span className="font-bold">{userName}</span>
        {action}
      </>
    );
  }

  // Pattern 4: "UserName mentioned you in a comment"
  const mentionPattern = /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+mentioned you)/i;
  const mentionMatch = message.match(mentionPattern);
  if (mentionMatch) {
    const userName = mentionMatch[1].trim().replace(/^"|"$/g, ''); // Remove quotes
    const action = message.substring(userName.length);
    return (
      <>
        <span className="font-bold">{userName}</span>
        {action}
      </>
    );
  }

  // Pattern 5: "UserName shared your post"
  const sharePattern =
    /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+shared your (?:post|artwork))/i;
  const shareMatch = message.match(sharePattern);
  if (shareMatch) {
    const userName = shareMatch[1].trim().replace(/^"|"$/g, ''); // Remove quotes
    const action = message.substring(userName.length);
    return (
      <>
        <span className="font-bold">{userName}</span>
        {action}
      </>
    );
  }

  // Pattern 6: "UserName added your post to their collection"
  const collectionPattern =
    /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+added your (?:post|artwork) to)/i;
  const collectionMatch = message.match(collectionPattern);
  if (collectionMatch) {
    const userName = collectionMatch[1].trim().replace(/^"|"$/g, ''); // Remove quotes
    const action = message.substring(userName.length);
    return (
      <>
        <span className="font-bold">{userName}</span>
        {action}
      </>
    );
  }

  // Pattern 7: General pattern for common verbs
  const generalPattern =
    /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+(?:published|liked|commented|followed|reported|updated|created|deleted|edited|voted|rated|reviewed|subscribed|unsubscribed|joined|left))/i;
  const generalMatch = message.match(generalPattern);
  if (generalMatch) {
    const userName = generalMatch[1].trim().replace(/^"|"$/g, ''); // Remove quotes
    const action = message.substring(userName.length);
    return (
      <>
        <span className="font-bold">{userName}</span>
        {action}
      </>
    );
  }

  // Pattern 8: Handle messages with usernames at the beginning followed by any verb
  const anyVerbPattern = /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+\w+)/i;
  const anyVerbMatch = message.match(anyVerbPattern);
  if (anyVerbMatch) {
    const userName = anyVerbMatch[1].trim().replace(/^"|"$/g, ''); // Remove quotes
    // Only apply bold if the username looks like a valid username (not just a single word like "The" or "A")
    if (
      userName.length >= 2 &&
      !['the', 'a', 'an', 'your', 'their', 'our'].includes(
        userName.toLowerCase(),
      )
    ) {
      const action = message.substring(userName.length);
      return (
        <>
          <span className="font-bold">{userName}</span>
          {action}
        </>
      );
    }
  }

  // If no pattern matches, return the original message
  return message;
};

// Helper function to handle notification clicks and navigation
const handleNotificationClick = (
  notif: Notification<NotificationPayload>,
  navigate: ReturnType<typeof useNavigate>,
  markAsRead: (id: string) => void,
) => {
  console.log('[UserButton] Notification clicked:', notif);

  // Mark the notification as read
  if (!notif.isRead) {
    markAsRead(notif.id);
  }

  // Navigate based on notification type and content
  const message = notif?.payload?.message || '';
  const payload = notif?.payload;

  console.log(
    '[UserButton] Notification type:',
    notif.type,
    'Message:',
    message,
    'Payload:',
    payload,
  );

  // Use notification type for better routing
  switch (notif.type) {
    case 'report_resolved':
    case 'REPORT_RESOLVED': {
      return;
    }

    case 'artwork_published': {
      // For post publishing notifications - navigate to the specific post
      const publishPayload = payload as PostNotificationPayload;
      console.log(
        '[UserButton] Post published notification, postId:',
        publishPayload?.postId,
      );
      if (publishPayload?.postId) {
        navigate(`/posts/${publishPayload.postId}`);
      } else {
        navigate('/explore');
      }
      return;
    }

    case 'artwork_liked': {
      // For like notifications - navigate directly to the liked post
      const likePayload = payload as PostNotificationPayload;
      console.log(
        '[UserButton] Post liked notification, postId:',
        likePayload?.postId,
      );
      if (likePayload?.postId) {
        navigate(`/posts/${likePayload.postId}`);
      } else {
        navigate('/explore');
      }
      return;
    }

    case 'artwork_commented': {
      const commentPayload = payload as PostNotificationPayload;
      console.log(
        '[UserButton] Comment notification, postId:',
        commentPayload?.postId,
        'commentId:',
        commentPayload?.commentId,
      );

      if (commentPayload?.postId && commentPayload?.commentId) {
        // Navigate to the post with the comment ID in state
        navigate(`/posts/${commentPayload.postId}`, {
          state: {
            highlightCommentId: commentPayload.commentId,
            scrollToComment: true,
          },
        });
      } else if (commentPayload?.postId) {
        // If we have post ID but no comment ID, just navigate to the post
        console.log(
          '[UserButton] Comment notification without commentId, navigating to post',
        );
        navigate(`/posts/${commentPayload.postId}`);
      } else {
        console.log(
          '[UserButton] Comment notification without postId, fallback to profile',
        );
        navigate('/profile');
      }
      return;
    }

    case 'user_followed': {
      // For follow notifications - navigate to the profile of the person who followed
      const followPattern =
        /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+(?:followed you|started following you))/i;
      const followMatch = message.match(followPattern);

      if (followMatch && followMatch[1]) {
        const username = followMatch[1].trim().replace(/^"|"$/g, ''); // Remove quotes if present
        console.log(
          '[UserButton] Follow notification, navigating to username:',
          username,
        );
        navigate(`/${username}`);
      } else {
        console.log('[UserButton] Follow notification, fallback to profile');
        navigate('/profile');
      }
      return;
    }

    default: {
      console.log(
        '[UserButton] Unknown notification type, using fallback logic',
      );
      // Fallback logic for legacy notifications or unknown types
      // For post-related notifications - navigate to the specific post
      if (
        message.includes('published a new post') ||
        message.includes('published new post:') ||
        message.includes('published new artwork')
      ) {
        const postPayload = payload as PostNotificationPayload;
        console.log(
          '[UserButton] Fallback: Post published, postId:',
          postPayload?.postId,
        );
        if (postPayload?.postId) {
          navigate(`/posts/${postPayload.postId}`);
        } else {
          navigate('/explore');
        }
        return;
      }

      // For like notifications - navigate directly to the liked post
      if (
        message.includes('liked your post') ||
        message.includes('liked your artwork')
      ) {
        const postPayload = payload as PostNotificationPayload;
        console.log(
          '[UserButton] Fallback: Post liked, postId:',
          postPayload?.postId,
        );
        if (postPayload?.postId) {
          navigate(`/posts/${postPayload.postId}`);
        } else {
          navigate('/explore');
        }
        return;
      }

      // For comment notifications - navigate to the post and scroll to the comment with highlighting
      if (
        message.includes('commented on your post') ||
        message.includes('commented on your artwork')
      ) {
        const postPayload = payload as PostNotificationPayload;
        console.log(
          '[UserButton] Fallback: Comment, postId:',
          postPayload?.postId,
          'commentId:',
          postPayload?.commentId,
        );
        if (postPayload?.postId && postPayload?.commentId) {
          navigate(`/posts/${postPayload.postId}`);

          // Use the same retry logic as the main handler
          let retryCount = 0;
          const maxRetries = 5;
          const checkInterval = 1000;

          const tryToFindComment = () => {
            const commentElement = document.getElementById(
              `comment-${postPayload.commentId}`,
            );
            console.log(
              `[UserButton] Fallback Attempt ${retryCount + 1} - Looking for comment element:`,
              `comment-${postPayload.commentId}`,
              'Found:',
              !!commentElement,
            );

            if (commentElement) {
              commentElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });

              // Enhanced highlighting with both CSS class and direct style application
              enhancedHighlightComment(commentElement);

              setTimeout(() => {
                removeEnhancedHighlight(commentElement);
              }, 3000);
            } else if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(tryToFindComment, checkInterval);
            } else {
              console.log(
                '[UserButton] Fallback: Could not find comment element after',
                maxRetries,
                'attempts',
              );
            }
          };

          setTimeout(tryToFindComment, 1500);
        } else if (postPayload?.postId) {
          navigate(`/posts/${postPayload.postId}`);
        } else {
          navigate('/profile');
        }
        return;
      }

      // For follow notifications - navigate to the profile of the person who followed
      if (
        message.includes('followed you') ||
        message.includes('started following you')
      ) {
        const followPattern =
          /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+(?:followed you|started following you))/i;
        const followMatch = message.match(followPattern);

        if (followMatch && followMatch[1]) {
          const username = followMatch[1].trim().replace(/^"|"$/g, '');
          console.log(
            '[UserButton] Fallback: Follow notification, username:',
            username,
          );
          navigate(`/${username}`);
        } else {
          navigate('/profile');
        }
        return;
      }

      // Default fallback - navigate to explore
      console.log('[UserButton] Using default fallback, navigating to explore');
      navigate('/explore');
    }
  }
};

const UserButton: React.FC<{
  user?: User | null;
  loading?: boolean;
}> = ({ user, loading }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const { notifications, markAsRead, markAllAsRead, unreadCount } =
    useNotifications();

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show a loading indicator while checking authentication
  if (loading) {
    return (
      <>
        <Skeleton className="dark:bg-mountain-900 flex h-9 w-20 items-center justify-center space-x-2 rounded-2xl xl:w-26"></Skeleton>
        <Skeleton className="dark:bg-mountain-900 flex h-9 w-20 items-center justify-center space-x-2 rounded-2xl xl:w-26"></Skeleton>
      </>
    );
  }

  // Show Sign Up and Login for non-logged-in users
  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Link
          to="/signup"
          className="xs:flex dark:hover:bg-mountain-700 border-mountain-950 dark:border-mountain-500 text-muted-foreground hidden h-9 w-24 items-center justify-center space-x-2 rounded-2xl border text-sm hover:bg-gray-100 xl:w-26 dark:text-gray-300"
        >
          <BsPen />
          <p>Sign Up</p>
        </Link>
        <Link
          to="/login"
          className="bg-mountain-950 hover:bg-mountain-600 dark:bg-mountain-200 dark:hover:bg-mountain-300 text-mountain-100 dark:text-mountain-950 flex h-9 w-20 items-center justify-center space-x-2 rounded-2xl text-sm xl:w-26"
        >
          <FiLogIn />
          <p>Login</p>
        </Link>
      </div>
    );
  }

  // Show Messages and Updates for logged-in users
  return (
    <div className="relative flex items-center space-x-2">
      <div className="relative">
        <Button
          onClick={toggleNotifications}
          className={`border-mountain-200 mr-2 flex h-10 w-10 items-center justify-center rounded-full border-[0.5px] bg-white hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 ${
            location.pathname === '/messages'
              ? 'dark:text-mountain-50 text-mountain-950' // Active: light text on dark, dark text on light
              : 'dark:text-mountain-500 text-mountain-700' // Inactive: lighter text on dark, darker text on light
          }`}
          sx={{
            minWidth: '2.5rem',
          }}
        >
          {' '}
          <FaBell />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
              style={{ minWidth: `${unreadCount >= 9 ? '1.4rem' : '1rem'}`, lineHeight: '1rem' }}
            >
              {unreadCount >= 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
        <div
          ref={notificationRef}
          className={`${
            isNotificationOpen ? 'visible opacity-100' : 'invisible opacity-0'
          } border-mountain-200 xs:w-80 xs:right-0 absolute top-full right-[-150px] z-50 mt-2 max-h-96 w-[calc(100vw-2rem)] overflow-hidden rounded-xl border bg-white shadow-2xl transition-all duration-300 ease-out dark:border-slate-600 dark:bg-slate-700`}
        >
          {' '}
          {/* Header */}
          <div className="border-mountain-200 sticky top-0 z-10 border-b bg-white px-4 py-3 dark:border-slate-600 dark:bg-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaBell className="text-indigo-600 dark:text-indigo-400" />{' '}
                <h4 className="text-mountain-950 dark:text-mountain-50 text-sm font-semibold">
                  Notifications
                </h4>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {unreadCount}
                  </span>
                )}
              </div>
              {/* Mark All Read - Always visible when there are unread notifications */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="rounded px-2 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-200"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>
          {/* Notifications List */}
          <div className="custom-scrollbar max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-8">
                <div className="bg-mountain-100 mb-3 flex h-12 w-12 items-center justify-center rounded-full dark:bg-slate-600">
                  <FaBell className="text-mountain-400 dark:text-mountain-300 text-xl" />
                </div>
                <h3 className="text-mountain-950 dark:text-mountain-50 mb-1 text-sm font-medium">
                  All caught up!
                </h3>
                <p className="text-mountain-500 dark:text-mountain-300 text-center text-xs">
                  You're all up to date.
                </p>
              </div>
            ) : (
              <div className="divide-mountain-100 divide-y dark:divide-slate-600">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {notifications.map((notif: any) => {
                  const getNotificationIcon = () => {
                    // You can enhance this based on notification type
                    switch (notif.type) {
                      case 'report_resolved':
                        return <FaCheckCircle className="text-green-500" />;
                      case 'warning':
                        return (
                          <FaExclamationTriangle className="text-yellow-500" />
                        );
                      default:
                        return <FaInfoCircle className="text-indigo-500" />;
                    }
                  };

                  const getNotificationBg = () => {
                    if (!notif.isRead) {
                      return 'bg-indigo-50 dark:bg-indigo-950/30 border-l-4 border-indigo-500';
                    }
                    return 'bg-white dark:bg-slate-700';
                  };

                  const isReportResolved =
                    notif.type === 'report_resolved' ||
                    notif.type === 'REPORT_RESOLVED';

                  return (
                    <div
                      key={notif.id}
                      className={`relative px-4 py-3 transition-all duration-200 ${getNotificationBg()} ${
                        isReportResolved
                          ? 'cursor-default opacity-90'
                          : 'hover:bg-mountain-50 cursor-pointer dark:hover:bg-slate-600/50'
                      }`}
                      onClick={() =>
                        !isReportResolved &&
                        handleNotificationClick(notif, navigate, markAsRead)
                      }
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="mt-0.5 flex-shrink-0">
                          <div className="bg-mountain-100 flex h-6 w-6 items-center justify-center rounded-full dark:bg-slate-600">
                            {getNotificationIcon()}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between">
                            <div className="mr-2 flex-1">
                              <p className="text-mountain-950 dark:text-mountain-50 text-left text-xs leading-relaxed font-medium">
                                {formatNotificationMessage(notif)}
                              </p>
                              <div className="mt-1 flex items-center space-x-2">
                                <time className="text-mountain-500 dark:text-mountain-300 text-xs">
                                  {formatDaysAgo(notif.createdAt)}
                                </time>
                                {!notif.isRead && (
                                  <span className="inline-flex items-center rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>{' '}
                            {/* Action Button */}
                            {!notif.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    '[UserButton] Marking notification as read:',
                                    notif.id,
                                  );
                                  markAsRead(notif.id);
                                }}
                                className="flex-shrink-0 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 transition-all duration-200 hover:bg-indigo-100 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
                                title="Mark as read"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="border-mountain-200 flex h-10 w-42 items-center justify-between rounded-full border-[0.5px] bg-white p-[2px] dark:border-slate-600 dark:bg-slate-700">
        <TokenPopover />
        <PurchaseButton />
      </div>
    </div>
  );
};

export default UserButton;
