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
import { createPortal } from 'react-dom';
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

// Portal component for the notification dropdown
const NotificationPortal = ({
  children,
  isOpen,
  triggerRef,
  onClose,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLElement>;
  onClose: () => void;
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = 320; // xs:w-80 = 320px

      setPosition({
        top: rect.bottom + 8,
        left: Math.max(16, rect.right - dropdownWidth), // Ensure it doesn't go off-screen
      });
    }
  }, [isOpen, triggerRef]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]" onClick={onClose}>
      <div
        className="absolute"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

// Enhanced highlighting functions for comment navigation
const enhancedHighlightComment = (element: HTMLElement) => {
  const originalStyles = {
    backgroundColor: element.style.backgroundColor,
    borderLeft: element.style.borderLeft,
    borderRadius: element.style.borderRadius,
    transition: element.style.transition,
    boxShadow: element.style.boxShadow,
    animation: element.style.animation,
  };

  element.setAttribute('data-original-styles', JSON.stringify(originalStyles));
  element.classList.add('highlight-comment');

  const isDarkMode =
    document.documentElement.classList.contains('dark') ||
    document.body.classList.contains('dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (isDarkMode) {
    element.style.backgroundColor = 'rgba(99, 102, 241, 0.25)';
    element.style.borderLeft = '4px solid rgb(129, 140, 248)';
    element.style.boxShadow = '0 0 0 1px rgba(129, 140, 248, 0.2)';
  } else {
    element.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
    element.style.borderLeft = '4px solid rgb(99, 102, 241)';
    element.style.boxShadow = '0 0 0 1px rgba(99, 102, 241, 0.1)';
  }

  element.style.borderRadius = '0.5rem';
  element.style.transition = 'all 0.3s ease-in-out';
  element.style.animation = 'highlight-pulse 0.6s ease-in-out';
};

const removeEnhancedHighlight = (element: HTMLElement) => {
  element.classList.remove('highlight-comment');

  try {
    const originalStylesStr = element.getAttribute('data-original-styles');
    if (originalStylesStr) {
      const originalStyles = JSON.parse(originalStylesStr);
      Object.keys(originalStyles).forEach((property) => {
        const value = originalStyles[property];
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        if (value) {
          element.style.setProperty(cssProperty, value);
        } else {
          element.style.removeProperty(cssProperty);
        }
      });
      element.removeAttribute('data-original-styles');
    } else {
      element.style.backgroundColor = '';
      element.style.borderLeft = '';
      element.style.borderRadius = '';
      element.style.transition = '';
      element.style.boxShadow = '';
      element.style.animation = '';
    }
  } catch (error) {
    console.warn('[UserButton] Error restoring original styles:', error);
    element.style.backgroundColor = '';
    element.style.borderLeft = '';
    element.style.borderRadius = '';
    element.style.transition = '';
    element.style.boxShadow = '';
    element.style.animation = '';
  }
};

// Helper function to format notification messages (keeping your existing function)
const formatNotificationMessage = (
  notif: Notification<NotificationPayload>,
) => {
  const message = notif?.payload?.message || '';

  if (
    message.includes('liked your artwork') ||
    message.includes('liked your post')
  ) {
    const parts = message.split(/ liked your (?:artwork|post)/);
    if (parts.length > 0 && parts[0]) {
      const userName = parts[0].trim().replace(/^"|"$/g, '');
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

  // Handle other notification patterns...
  return formatMessageWithBoldNames(message);
};

// Helper function to make names bold (keeping your existing function)
const formatMessageWithBoldNames = (message: string) => {
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

  const followingPattern =
    /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+started following you)/i;
  const followingMatch = message.match(followingPattern);
  if (followingMatch) {
    const userName = followingMatch[1].trim().replace(/^"|"$/g, '');
    const action = message.substring(userName.length);
    return (
      <>
        <span className="font-bold">{userName}</span>
        {action}
      </>
    );
  }

  return message;
};

// Helper function to handle notification clicks with comment highlighting
const handleNotificationClick = (
  notif: Notification<NotificationPayload>,
  navigate: ReturnType<typeof useNavigate>,
  markAsRead: (id: string) => void,
) => {
  if (!notif.isRead) {
    markAsRead(notif.id);
  }

  const message = notif?.payload?.message || '';
  const payload = notif?.payload;

  switch (notif.type) {
    case 'report_resolved':
    case 'REPORT_RESOLVED':
      return;

    case 'artwork_published': {
      const publishPayload = payload as PostNotificationPayload;
      if (publishPayload?.postId) {
        navigate(`/posts/${publishPayload.postId}`);
      } else {
        navigate('/explore');
      }
      return;
    }

    case 'artwork_liked': {
      const likePayload = payload as PostNotificationPayload;
      if (likePayload?.postId) {
        navigate(`/posts/${likePayload.postId}`);
      } else {
        navigate('/explore');
      }
      return;
    }

    case 'artwork_commented': {
      const commentPayload = payload as PostNotificationPayload;
      if (commentPayload?.postId && commentPayload?.commentId) {
        navigate(`/posts/${commentPayload.postId}`, {
          state: {
            highlightCommentId: commentPayload.commentId,
            scrollToComment: true,
          },
        });

        // Enhanced comment highlighting with retry logic
        let retryCount = 0;
        const maxRetries = 5;
        const checkInterval = 1000;

        const tryToFindComment = () => {
          const commentElement = document.getElementById(
            `comment-${commentPayload.commentId}`,
          );
          if (commentElement) {
            commentElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
            enhancedHighlightComment(commentElement);
            setTimeout(() => {
              removeEnhancedHighlight(commentElement);
            }, 3000);
          } else if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(tryToFindComment, checkInterval);
          }
        };

        setTimeout(tryToFindComment, 1500);
      } else if (commentPayload?.postId) {
        navigate(`/posts/${commentPayload.postId}`);
      } else {
        navigate('/profile');
      }
      return;
    }

    case 'user_followed': {
      const followPattern =
        /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+(?:followed you|started following you))/i;
      const followMatch = message.match(followPattern);
      if (followMatch && followMatch[1]) {
        const username = followMatch[1].trim().replace(/^"|"$/g, '');
        navigate(`/u/${username}`);
      } else {
        navigate('/profile');
      }
      return;
    }

    default: {
      // Handle legacy notification formats
      if (
        message.includes('commented on your post') ||
        message.includes('commented on your artwork')
      ) {
        const postPayload = payload as PostNotificationPayload;
        if (postPayload?.postId && postPayload?.commentId) {
          navigate(`/posts/${postPayload.postId}`);

          let retryCount = 0;
          const maxRetries = 5;
          const checkInterval = 1000;

          const tryToFindComment = () => {
            const commentElement = document.getElementById(
              `comment-${postPayload.commentId}`,
            );
            if (commentElement) {
              commentElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
              enhancedHighlightComment(commentElement);
              setTimeout(() => {
                removeEnhancedHighlight(commentElement);
              }, 3000);
            } else if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(tryToFindComment, checkInterval);
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
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { notifications, markAsRead, markAllAsRead, unreadCount } =
    useNotifications();

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const closeNotifications = () => {
    setIsNotificationOpen(false);
  };

  // Show loading indicator
  if (loading) {
    return (
      <>
        <Skeleton className="dark:bg-mountain-900 flex h-9 w-20 items-center justify-center space-x-2 rounded-2xl xl:w-26" />
        <Skeleton className="dark:bg-mountain-900 flex h-9 w-20 items-center justify-center space-x-2 rounded-2xl xl:w-26" />
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
          ref={buttonRef}
          onClick={toggleNotifications}
          className={`border-mountain-200 mr-2 flex h-10 w-10 items-center justify-center rounded-full border-[0.5px] bg-white hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 ${
            location.pathname === '/messages'
              ? 'dark:text-mountain-50 text-mountain-950'
              : 'dark:text-mountain-500 text-mountain-700'
          }`}
          sx={{ minWidth: '2.5rem' }}
        >
          <FaBell />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
              style={{
                minWidth: `${unreadCount >= 9 ? '1.4rem' : '1rem'}`,
                lineHeight: '1rem',
              }}
            >
              {unreadCount >= 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>

        <NotificationPortal
          isOpen={isNotificationOpen}
          triggerRef={buttonRef}
          onClose={closeNotifications}
        >
          <div className="border-mountain-200 xs:w-80 max-h-96 w-[calc(100vw-2rem)] overflow-hidden rounded-xl border bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-700">
            {/* Header */}
            <div className="border-mountain-200 sticky top-0 z-10 border-b bg-white px-4 py-3 dark:border-slate-600 dark:bg-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FaBell className="text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-mountain-950 dark:text-mountain-50 text-sm font-semibold">
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="rounded px-2 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
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
                  {notifications.map(
                    (notif: Notification<NotificationPayload>) => {
                      const getNotificationIcon = () => {
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
                          onClick={() => {
                            if (!isReportResolved) {
                              handleNotificationClick(
                                notif,
                                navigate,
                                markAsRead,
                              );
                              closeNotifications();
                            }
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="mt-0.5 flex-shrink-0">
                              <div className="bg-mountain-100 flex h-6 w-6 items-center justify-center rounded-full dark:bg-slate-600">
                                {getNotificationIcon()}
                              </div>
                            </div>

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
                                </div>
                                {!notif.isRead && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notif.id);
                                    }}
                                    className="flex-shrink-0 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 transition-all duration-200 hover:bg-indigo-100 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
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
                    },
                  )}
                </div>
              )}
            </div>
          </div>
        </NotificationPortal>
      </div>

      <div className="border-mountain-200 flex h-10 w-42 items-center justify-between rounded-full border-[0.5px] bg-white p-[2px] dark:border-slate-600 dark:bg-slate-700">
        <TokenPopover />
        <PurchaseButton />
      </div>
    </div>
  );
};

export default UserButton;
