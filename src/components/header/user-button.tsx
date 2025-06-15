import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

//Icons
import { FiLogIn } from "react-icons/fi";
import { BsPen } from "react-icons/bs";
import { BiSolidCoinStack } from "react-icons/bi";
import { FaBell } from "react-icons/fa6";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";

//Components
import { Skeleton } from "../ui/skeleton";

//Types
import { User } from "@/types";
import {
  Notification,
  NotificationPayload,
  PostNotificationPayload,
} from "@/contexts/NotificationsContext";
import PurchaseButton from "../buttons/PurchaseButton";
import { Button } from "@mui/material";
import { useNotifications } from "@/contexts/NotificationsContext";
import { formatDaysAgo } from "@/lib/utils";

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
  element.setAttribute("data-original-styles", JSON.stringify(originalStyles));

  // Add CSS class first (for browsers where CSS works)
  element.classList.add("highlight-comment");

  // Apply direct styles as backup (to override MUI theme conflicts)
  const isDarkMode =
    document.documentElement.classList.contains("dark") ||
    document.body.classList.contains("dark") ||
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (isDarkMode) {
    // Dark mode styles
    element.style.backgroundColor = "rgba(99, 102, 241, 0.25)";
    element.style.borderLeft = "4px solid rgb(129, 140, 248)";
    element.style.boxShadow = "0 0 0 1px rgba(129, 140, 248, 0.2)";
  } else {
    // Light mode styles
    element.style.backgroundColor = "rgba(99, 102, 241, 0.15)";
    element.style.borderLeft = "4px solid rgb(99, 102, 241)";
    element.style.boxShadow = "0 0 0 1px rgba(99, 102, 241, 0.1)";
  }

  // Common styles
  element.style.borderRadius = "0.5rem";
  element.style.transition = "all 0.3s ease-in-out";

  // Add pulse animation using JavaScript
  element.style.animation = "highlight-pulse 0.6s ease-in-out";

  console.log("[UserButton] Enhanced highlighting applied to element:", {
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
  element.classList.remove("highlight-comment");

  // Restore original styles
  try {
    const originalStylesStr = element.getAttribute("data-original-styles");
    if (originalStylesStr) {
      const originalStyles = JSON.parse(originalStylesStr);

      // Restore each style property using setProperty
      Object.keys(originalStyles).forEach((property) => {
        const value = originalStyles[property];
        const cssProperty = property.replace(/([A-Z])/g, "-$1").toLowerCase();
        if (value) {
          element.style.setProperty(cssProperty, value);
        } else {
          element.style.removeProperty(cssProperty);
        }
      });

      // Remove the data attribute
      element.removeAttribute("data-original-styles");
    } else {
      // Fallback: reset to empty strings if no original styles stored
      element.style.backgroundColor = "";
      element.style.borderLeft = "";
      element.style.borderRadius = "";
      element.style.transition = "";
      element.style.boxShadow = "";
      element.style.animation = "";
    }
  } catch (error) {
    console.warn("[UserButton] Error restoring original styles:", error);
    // Fallback: reset to empty strings
    element.style.backgroundColor = "";
    element.style.borderLeft = "";
    element.style.borderRadius = "";
    element.style.transition = "";
    element.style.boxShadow = "";
    element.style.animation = "";
  }

  console.log(
    "[UserButton] Enhanced highlighting removed from element:",
    element.id,
  );
};

// Helper function to format notification messages with enhanced content
const formatNotificationMessage = (
  notif: Notification<NotificationPayload>,
) => {
  const message = notif?.payload?.message || "";

  // Enhanced message formatting with post names
  if (
    message.includes("liked your artwork") ||
    message.includes("liked your post")
  ) {
    // Try to extract post title if available in the message
    const parts = message.split(/ liked your (?:artwork|post)/);
    if (parts.length > 0 && parts[0]) {
      const userName = parts[0].trim().replace(/^"|"$/g, ""); // Remove quotes if present

      // Check if we have post title in payload
      const postPayload = notif.payload as PostNotificationPayload;
      if (postPayload?.postTitle) {
        return (
          <>
            <span className="font-bold">{userName}</span> liked your post:{" "}
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
    message.includes("commented on your artwork") ||
    message.includes("commented on your post")
  ) {
    const parts = message.split(/ commented on your (?:artwork|post)/);
    if (parts.length > 0 && parts[0]) {
      const userName = parts[0].trim().replace(/^"|"$/g, "");

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
  if (message.includes("published new post:")) {
    const publishPattern =
      /^([^.\s]+(?:\s+[^.\s]+)*?)\s+published new post:\s*"?([^"]+)"?$/i;
    const publishMatch = message.match(publishPattern);

    if (publishMatch && publishMatch[1] && publishMatch[2]) {
      const userName = publishMatch[1].trim();
      const postTitle = publishMatch[2].trim();
      return (
        <>
          <span className="font-bold">{userName}</span> published new post:{" "}
          <span className="font-semibold">{postTitle}</span>
        </>
      );
    }
  }

  // Handle legacy formats or when post title is in payload
  if (
    message.includes("published new artwork") ||
    message.includes("published a new post")
  ) {
    // Handle the "published new post" format with post title
    const postPayload = notif.payload as PostNotificationPayload;

    // Extract username from message
    const publishPattern =
      /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+(?:published new artwork|published a new post))/i;
    const publishMatch = message.match(publishPattern);

    if (publishMatch && publishMatch[1]) {
      const userName = publishMatch[1].trim().replace(/^"|"$/g, "");

      // Always show with post title if available, otherwise use generic format
      if (postPayload?.postTitle) {
        return (
          <>
            <span className="font-bold">{userName}</span> published new post:{" "}
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
  if (message.includes("published new post:")) {
    const parts = message.split(" published new post:");
    if (parts.length >= 2 && parts[0] && parts[1]) {
      const userName = parts[0].trim().replace(/^"|"$/g, "");
      const postTitle = parts[1].trim();
      return (
        <>
          <span className="font-bold">{userName}</span> published new post:{" "}
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
  // This is a simple implementation that tries to identify user names
  // You might want to enhance this based on your specific message formats

  // Look for patterns like "UserName did something" or "UserName published"
  const namePattern =
    /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+(?:published|liked|commented|followed|reported|updated))/i;
  const match = message.match(namePattern);

  if (match) {
    const userName = match[1];
    const action = message.substring(userName.length);
    return (
      <>
        <span className="font-bold">{userName}</span>
        {action}
      </>
    );
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
  console.log("[UserButton] Notification clicked:", notif);

  // Mark the notification as read
  if (!notif.isRead) {
    markAsRead(notif.id);
  }

  // Navigate based on notification type and content
  const message = notif?.payload?.message || "";
  const payload = notif?.payload;

  console.log(
    "[UserButton] Notification type:",
    notif.type,
    "Message:",
    message,
    "Payload:",
    payload,
  );

  // Use notification type for better routing
  switch (notif.type) {
    case "report_resolved":
    case "REPORT_RESOLVED": {
      return;
    }

    case "artwork_published": {
      // For post publishing notifications - navigate to the specific post
      const publishPayload = payload as PostNotificationPayload;
      console.log(
        "[UserButton] Post published notification, postId:",
        publishPayload?.postId,
      );
      if (publishPayload?.postId) {
        navigate(`/posts/${publishPayload.postId}`);
      } else {
        navigate("/explore");
      }
      return;
    }

    case "artwork_liked": {
      // For like notifications - navigate directly to the liked post
      const likePayload = payload as PostNotificationPayload;
      console.log(
        "[UserButton] Post liked notification, postId:",
        likePayload?.postId,
      );
      if (likePayload?.postId) {
        navigate(`/posts/${likePayload.postId}`);
      } else {
        navigate("/explore");
      }
      return;
    }

    case "artwork_commented": {
      const commentPayload = payload as PostNotificationPayload;
      console.log(
        "[UserButton] Comment notification, postId:",
        commentPayload?.postId,
        "commentId:",
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
          "[UserButton] Comment notification without commentId, navigating to post",
        );
        navigate(`/posts/${commentPayload.postId}`);
      } else {
        console.log(
          "[UserButton] Comment notification without postId, fallback to profile",
        );
        navigate("/profile");
      }
      return;
    }

    case "user_followed": {
      // For follow notifications - navigate to the profile of the person who followed
      const followPattern =
        /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+(?:followed you|started following you))/i;
      const followMatch = message.match(followPattern);

      if (followMatch && followMatch[1]) {
        const username = followMatch[1].trim().replace(/^"|"$/g, ""); // Remove quotes if present
        console.log(
          "[UserButton] Follow notification, navigating to username:",
          username,
        );
        navigate(`/${username}`);
      } else {
        console.log("[UserButton] Follow notification, fallback to profile");
        navigate("/profile");
      }
      return;
    }

    default: {
      console.log(
        "[UserButton] Unknown notification type, using fallback logic",
      );
      // Fallback logic for legacy notifications or unknown types
      // For post-related notifications - navigate to the specific post
      if (
        message.includes("published a new post") ||
        message.includes("published new post:") ||
        message.includes("published new artwork")
      ) {
        const postPayload = payload as PostNotificationPayload;
        console.log(
          "[UserButton] Fallback: Post published, postId:",
          postPayload?.postId,
        );
        if (postPayload?.postId) {
          navigate(`/posts/${postPayload.postId}`);
        } else {
          navigate("/explore");
        }
        return;
      }

      // For like notifications - navigate directly to the liked post
      if (
        message.includes("liked your post") ||
        message.includes("liked your artwork")
      ) {
        const postPayload = payload as PostNotificationPayload;
        console.log(
          "[UserButton] Fallback: Post liked, postId:",
          postPayload?.postId,
        );
        if (postPayload?.postId) {
          navigate(`/posts/${postPayload.postId}`);
        } else {
          navigate("/explore");
        }
        return;
      }

      // For comment notifications - navigate to the post and scroll to the comment with highlighting
      if (
        message.includes("commented on your post") ||
        message.includes("commented on your artwork")
      ) {
        const postPayload = payload as PostNotificationPayload;
        console.log(
          "[UserButton] Fallback: Comment, postId:",
          postPayload?.postId,
          "commentId:",
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
              "Found:",
              !!commentElement,
            );

            if (commentElement) {
              commentElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
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
                "[UserButton] Fallback: Could not find comment element after",
                maxRetries,
                "attempts",
              );
            }
          };

          setTimeout(tryToFindComment, 1500);
        } else if (postPayload?.postId) {
          navigate(`/posts/${postPayload.postId}`);
        } else {
          navigate("/profile");
        }
        return;
      }

      // For follow notifications - navigate to the profile of the person who followed
      if (
        message.includes("followed you") ||
        message.includes("started following you")
      ) {
        const followPattern =
          /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+(?:followed you|started following you))/i;
        const followMatch = message.match(followPattern);

        if (followMatch && followMatch[1]) {
          const username = followMatch[1].trim().replace(/^"|"$/g, "");
          console.log(
            "[UserButton] Fallback: Follow notification, username:",
            username,
          );
          navigate(`/${username}`);
        } else {
          navigate("/profile");
        }
        return;
      }

      // Default fallback - navigate to explore
      console.log("[UserButton] Using default fallback, navigating to explore");
      navigate("/explore");
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Show a loading indicator while checking authentication
  if (loading) {
    return (
      <>
        <Skeleton className="flex justify-center items-center space-x-2 dark:bg-mountain-900 rounded-2xl w-20 xl:w-26 h-9"></Skeleton>
        <Skeleton className="flex justify-center items-center space-x-2 dark:bg-mountain-900 rounded-2xl w-20 xl:w-26 h-9"></Skeleton>
      </>
    );
  }

  // Show Sign Up and Login for non-logged-in users
  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Link
          to="/signup"
          className="hidden xs:flex justify-center items-center space-x-2 border border-mountain-950 dark:border-mountain-500 rounded-2xl w-24 xl:w-26 h-9 text-muted-foreground dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-mountain-700"
        >
          <BsPen />
          <p>Sign Up</p>
        </Link>
        <Link
          to="/login"
          className="flex justify-center items-center space-x-2 bg-mountain-950 hover:bg-mountain-600 dark:bg-mountain-200 dark:hover:bg-mountain-300 rounded-2xl w-20 xl:w-26 h-9 text-mountain-100 dark:text-mountain-950 text-sm"
        >
          <FiLogIn />
          <p>Login</p>
        </Link>
      </div>
    );
  }

  // Show Messages and Updates for logged-in users
  return (
    <div className="flex items-center space-x-2 relative">
      <div className="relative">
        <Button
          onClick={toggleNotifications}
          className={`flex bg-white dark:bg-slate-700 items-center border-[0.5px] border-mountain-200 dark:border-slate-600 mr-2 h-8 w-8 rounded-full justify-center hover:bg-gray-100 dark:hover:bg-slate-600 ${
            location.pathname === "/messages"
              ? "dark:text-mountain-50 text-mountain-950" // Active: light text on dark, dark text on light
              : "dark:text-mountain-500 text-mountain-700" // Inactive: lighter text on dark, darker text on light
          }`}
        >
          {" "}
          <FaBell />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
              style={{ minWidth: "1rem", lineHeight: "1rem" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>

        <div
          ref={notificationRef}
          className={`${
            isNotificationOpen ? "visible opacity-100" : "invisible opacity-0"
          } transition-all duration-300 ease-out absolute top-full mt-2 max-h-96 bg-white dark:bg-slate-700 rounded-xl shadow-2xl border border-mountain-200 dark:border-slate-600 z-50 overflow-hidden w-[calc(100vw-2rem)] xs:w-80 right-[-150px] xs:right-0`}
        >
          {" "}
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-700 border-b border-mountain-200 dark:border-slate-600 px-4 py-3 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaBell className="text-indigo-600 dark:text-indigo-400" />{" "}
                <h4 className="text-sm font-semibold text-mountain-950 dark:text-mountain-50">
                  Notifications
                </h4>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {unreadCount}
                  </span>
                )}
              </div>
              {/* Mark All Read - Always visible when there are unread notifications */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium transition-colors px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>
          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <div className="w-12 h-12 bg-mountain-100 dark:bg-slate-600 rounded-full flex items-center justify-center mb-3">
                  <FaBell className="text-xl text-mountain-400 dark:text-mountain-300" />
                </div>
                <h3 className="text-sm font-medium text-mountain-950 dark:text-mountain-50 mb-1">
                  All caught up!
                </h3>
                <p className="text-xs text-mountain-500 dark:text-mountain-300 text-center">
                  You're all up to date.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-mountain-100 dark:divide-slate-600">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {notifications.map((notif: any) => {
                  const getNotificationIcon = () => {
                    // You can enhance this based on notification type
                    switch (notif.type) {
                      case "report_resolved":
                        return <FaCheckCircle className="text-green-500" />;
                      case "warning":
                        return (
                          <FaExclamationTriangle className="text-yellow-500" />
                        );
                      default:
                        return <FaInfoCircle className="text-indigo-500" />;
                    }
                  };

                  const getNotificationBg = () => {
                    if (!notif.isRead) {
                      return "bg-indigo-50 dark:bg-indigo-950/30 border-l-4 border-indigo-500";
                    }
                    return "bg-white dark:bg-slate-700";
                  };

                  const isReportResolved =
                    notif.type === "report_resolved" ||
                    notif.type === "REPORT_RESOLVED";

                  return (
                    <div
                      key={notif.id}
                      className={`relative px-4 py-3 transition-all duration-200 ${getNotificationBg()} ${
                        isReportResolved
                          ? "cursor-default opacity-90"
                          : "hover:bg-mountain-50 dark:hover:bg-slate-600/50 cursor-pointer"
                      }`}
                      onClick={() =>
                        !isReportResolved &&
                        handleNotificationClick(notif, navigate, markAsRead)
                      }
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-6 h-6 rounded-full bg-mountain-100 dark:bg-slate-600 flex items-center justify-center">
                            {getNotificationIcon()}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 mr-2">
                              <p className="text-xs font-medium text-mountain-950 dark:text-mountain-50 leading-relaxed text-left">
                                {formatNotificationMessage(notif)}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <time className="text-xs text-mountain-500 dark:text-mountain-300">
                                  {formatDaysAgo(notif.createdAt)}
                                </time>
                                {!notif.isRead && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>{" "}
                            {/* Action Button */}
                            {!notif.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "[UserButton] Marking notification as read:",
                                    notif.id,
                                  );
                                  markAsRead(notif.id);
                                }}
                                className="flex-shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 px-2 py-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all duration-200"
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
      <div className="flex justify-between items-center bg-white dark:bg-slate-700 p-[2px] border-[0.5px] border-mountain-200 dark:border-slate-600 rounded-full w-42 h-10">
        <div className="flex items-center space-x-1 px-2">
          <BiSolidCoinStack className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-gray-800 dark:text-gray-100">50</span>
        </div>
        <PurchaseButton />
      </div>
    </div>
  );
};

export default UserButton;
