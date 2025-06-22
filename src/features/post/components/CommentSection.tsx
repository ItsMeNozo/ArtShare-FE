import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  MouseEvent,
  useCallback,
} from "react";
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextareaAutosize,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import {
  ChevronDown,
  ChevronUp,
  SendHorizontal,
  Heart,
  MoreVertical,
} from "lucide-react";
import Avatar from "boring-avatars";
import { useFocusContext } from "@/contexts/focus/useFocusText";
import api from "@/api/baseApi";
import {
  likeComment,
  createComment,
  fetchComments,
  unlikeComment,
} from "../api/comment.api";
import { CommentUI, CreateCommentDto } from "@/types/comment";
import { useUser } from "@/contexts/UserProvider";
import { User } from "@/types";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import MuiLink from "@mui/material/Link";
import { useSnackbar } from "@/hooks/useSnackbar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useContext } from "react";
import { FreshRepliesCtx } from "./FreshReplies";
import { isTemporaryCommentId } from "@/lib/utils";
import { TargetType } from "@/utils/constants";
import ReactTimeAgo from "react-time-ago";
/* ------------------------------------------------------------------ */
/* Constants & helpers                                                */
/* ------------------------------------------------------------------ */
const INDENT = 44;
const MAX_REPLY_DEPTH = 3;

export interface CommentSectionRef {
  highlightComment: (commentId: number) => void;
  focusCommentInput: () => void;
  getScrollContainer: () => HTMLElement;
  expandToComment: (commentId: number) => Promise<boolean>;
  scrollToComment: (commentId: number, highlight?: boolean) => Promise<boolean>;
  debugScrollToComment: (commentId: number) => void;
}

const DATETIME_FORMAT_OPTIONS_FOR_TITLE: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

const addReplyRecursive = (
  list: CommentUI[],
  parentId: number,
  reply: CommentUI,
): CommentUI[] =>
  list.map((c) => {
    if (c.id === parentId) {
      const updatedReplies = c.replies ? [...c.replies, reply] : [reply];
      // Sort replies by creation date to ensure latest is at bottom
      const sortedReplies = updatedReplies.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
      return {
        ...c,
        replies: sortedReplies,
        reply_count: (c.reply_count ?? 0) + 1,
      };
    }
    return c.replies?.length
      ? { ...c, replies: addReplyRecursive(c.replies, parentId, reply) }
      : c;
  });

const toggleLikeRecursive = (list: CommentUI[], id: number): CommentUI[] =>
  list.map((c) =>
    c.id === id
      ? {
          ...c,
          likedByCurrentUser: !c.likedByCurrentUser,
          like_count: (c.like_count ?? 0) + (c.likedByCurrentUser ? -1 : 1),
        }
      : c.replies?.length
        ? { ...c, replies: toggleLikeRecursive(c.replies, id) }
        : c,
  );

const removeRecursive = (list: CommentUI[], id: number): CommentUI[] => {
  return list
    .filter((c) => c.id !== id)
    .map((c) => {
      if (c.replies?.length) {
        const originalReplyCount = c.replies.length;
        const updatedReplies = removeRecursive(c.replies, id);
        const newReplyCount = updatedReplies.length;

        // If we removed a reply, update the reply_count
        if (originalReplyCount !== newReplyCount) {
          return {
            ...c,
            replies: updatedReplies,
            reply_count: Math.max(
              0,
              (c.reply_count ?? 0) - (originalReplyCount - newReplyCount),
            ),
          };
        }

        return { ...c, replies: updatedReplies };
      }
      return c;
    });
};

const updateContentRecursive = (
  list: CommentUI[],
  id: number,
  content: string,
): CommentUI[] =>
  list.map((c) =>
    c.id === id
      ? { ...c, content, updated_at: new Date() }
      : c.replies?.length
        ? { ...c, replies: updateContentRecursive(c.replies, id, content) }
        : c,
  );

/* ------------------------------------------------------------------ */
/* Single comment row                                                 */
/* ------------------------------------------------------------------ */
interface RowProps {
  targetId: number;
  targetType: TargetType;
  depth?: number;
  comment: CommentUI;
  isHighlighted?: boolean;
  highlightedCommentId?: number | null; // Changed string to number
  onLike: (id: number) => void;
  onReply: (id: number, username: string) => void;
  onDelete: (id: number) => void;
  onRepliesFetched: (id: number, replies: CommentUI[]) => void;
  editingId: number | null;
  onStartEdit: (id: number) => void;
  onAbortEdit: () => void;
  onCommitEdit: (id: number, value: string) => Promise<void>;
  onSubmitReply: (parentId: number, content: string) => void;
}

const CommentRow = ({
  targetId,
  targetType,
  depth = 0,
  comment,
  onLike,
  onReply,
  onDelete,
  onRepliesFetched,
  editingId,
  onStartEdit,
  onAbortEdit,
  onCommitEdit,
  onSubmitReply,
  isHighlighted = false,
  highlightedCommentId,
}: RowProps) => {
  const navigate = useNavigate();
  console.log(
    `[CommentRow] Rendering comment ${comment.id}, highlighted: ${isHighlighted}, highlightedId: ${highlightedCommentId}`,
  );

  // Add effect to log when isHighlighted changes
  useEffect(() => {
    if (isHighlighted) {
      console.log(`[CommentRow] Comment ${comment.id} is now highlighted!`);
    } else {
      console.log(`[CommentRow] Comment ${comment.id} is not highlighted`);
    }
  }, [isHighlighted, comment.id]);

  /* ── fresh-reply context ──────────────────────────────── */
  const { map: freshMap, clear: clearFreshIds } = useContext(FreshRepliesCtx);
  const freshIds: Set<number> = freshMap[comment.id] ?? new Set();
  const { user } = useUser();
  const { showSnackbar } = useSnackbar();
  const CURRENT_USER_ID = user?.id;
  const isMine = comment.user_id === CURRENT_USER_ID;
  const isEditing = editingId === comment.id;
  const editRef = useRef<HTMLTextAreaElement>(null);
  const prevReplyCountRef = useRef(comment.replies?.length || 0);
  const [showReplies, setShowReplies] = useState(false);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const openMenu = Boolean(anchorEl);
  const handleMenu = (e: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);
  const requireAuth = useRequireAuth();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  const olderCount = Math.max(0, (comment.reply_count ?? 0) - freshIds.size);
  // show the thread container if there's any older OR any fresh replies
  const showThread = olderCount > 0 || freshIds.size > 0;
  // only show the “View/Hide” button when there are truly older replies
  const showToggle = olderCount > 0;
  const thisCommentIsTemporary = isTemporaryCommentId(comment.id);
  const canReplyToThisComment = depth < MAX_REPLY_DEPTH;

  /**
   * When we come back to the page, `freshIds` may contain ids but
   * `comment.replies` is still empty.  Pull the replies once so the new
   * comment can render even while the thread is collapsed.
   */
  useEffect(() => {
    if (
      freshIds.size > 0 &&
      (!comment.replies || comment.replies.length === 0) &&
      !loading
    ) {
      (async () => {
        try {
          setLoading(true);
          const fetched = await fetchComments(targetId, targetType, comment.id);
          onRepliesFetched(comment.id, fetched as CommentUI[]);
        } finally {
          setLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freshIds]);

  useEffect(() => {
    const prev = prevReplyCountRef.current;
    const curr = comment.replies?.length ?? 0;

    // Only auto-expand if there are NO fresh replies (meaning this is from fetching old replies)
    // Auto-expand **only** when there are no hidden older replies.
    if (prev === 0 && curr > 0 && !showReplies && olderCount === 0) {
      setShowReplies(true);
    }
    prevReplyCountRef.current = curr;
  }, [comment.replies, showReplies, freshIds.size, olderCount]);

  const toggleReplies = async () => {
    const loaded = comment.replies?.length ?? 0;
    const total = comment.reply_count ?? 0;
    const needsToFetch = !showReplies && loaded < total;

    if (needsToFetch) {
      try {
        setLoading(true);
        const fetchedReplies = await fetchComments(
          targetId,
          targetType,
          comment.id,
        );
        onRepliesFetched(comment.id, fetchedReplies as CommentUI[]);
      } catch (err) {
        console.error(
          "Failed to load replies for comment " + comment.id + ":",
          err,
        );
        showSnackbar("Failed to load replies", "error");
      } finally {
        setLoading(false);
      }
    }
    setShowReplies((s) => {
      const next = !s;
      if (next) clearFreshIds(comment.id);
      return next;
    });
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      const m = part.match(/^@(\w+)$/);
      if (m) {
        const username = m[1];
        return (
          <MuiLink
            key={i}
            component={RouterLink}
            to={`/${username}`}
            color="primary"
            underline="hover"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
          >
            @{username}
          </MuiLink>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div
      id={`comment-${comment.id}`}
      className={`w-full comment-item ${isHighlighted ? "comment-highlighted" : ""}`}
    >
      <Box className="w-full">
        <div className="flex w-full gap-3 py-3">
          {comment.user.profile_picture_url ? (
            <img
              src={comment.user.profile_picture_url}
              alt={comment.user.username}
              className="object-cover w-8 h-8 rounded-full ring-2 ring-transparent hover:ring-blue-500/30 transition-all duration-200 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${comment.user.username}`);
              }}
            />
          ) : (
            <div
              className="ring-2 ring-transparent hover:ring-blue-500/30 transition-all duration-200 cursor-pointer rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${comment.user.username}`);
              }}
            >
              <Avatar
                name={comment.user.username}
                size={32}
                variant="beam"
                colors={["#84bfc3", "#ff9b62", "#d96153"]}
              />
            </div>
          )}
          <div className="flex flex-col flex-grow">
            <div className="flex items-center gap-2 text-sm">
              <span
                className="font-bold hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/${comment.user.username}`);
                }}
              >
                @{comment.user.username}
              </span>
              <span
                className="text-neutral-500 dark:text-neutral-400 text-xs"
                title={
                  new Date(comment.updated_at).getTime() !==
                  new Date(comment.created_at).getTime()
                    ? `Edited ${new Date(comment.updated_at).toLocaleString(
                        undefined,
                        DATETIME_FORMAT_OPTIONS_FOR_TITLE,
                      )}`
                    : undefined
                }
              >
                <ReactTimeAgo
                  date={new Date(comment.updated_at)}
                  locale="en-US"
                />
                {new Date(comment.updated_at).getTime() !==
                  new Date(comment.created_at).getTime() && " (edited)"}
              </span>
            </div>

            {isEditing ? (
              <div className="flex flex-col gap-2">
                <TextareaAutosize
                  ref={editRef}
                  defaultValue={comment.content}
                  minRows={2}
                  className="w-full p-2 border rounded-md border-neutral-300"
                />
                <div className="flex gap-2 text-xs">
                  <Button
                    size="small"
                    onClick={async () =>
                      await onCommitEdit(
                        comment.id,
                        editRef.current!.value.trim(),
                      )
                    }
                  >
                    Save
                  </Button>
                  <Button size="small" variant="outlined" onClick={onAbortEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm whitespace-pre-wrap">
                {renderContent(comment.content)}
              </div>
            )}

            {!isEditing && (
              <div className="flex items-center gap-1 mt-1">
                <IconButton
                  size="small"
                  color={comment.likedByCurrentUser ? "primary" : "default"}
                  onClick={() =>
                    requireAuth("like comments", () => onLike(comment.id))
                  }
                  disabled={false} // We'll handle the debouncing in the parent
                >
                  <Heart
                    size={16}
                    fill={comment.likedByCurrentUser ? "currentColor" : "none"}
                    stroke="currentColor"
                  />
                </IconButton>
                <Typography variant="caption" sx={{ mr: 2 }}>
                  {comment.like_count ?? 0}
                </Typography>
                {canReplyToThisComment && (
                  <Button
                    size="small"
                    color="primary"
                    onClick={() =>
                      requireAuth("reply to comments", () => {
                        setReplying((v) => !v);
                        setTimeout(() => replyInputRef.current?.focus(), 0);
                      })
                    }
                  >
                    {replying ? "Cancel" : "Reply"}
                  </Button>
                )}
              </div>
            )}
          </div>

          {isMine && !isEditing && (
            <>
              <IconButton
                size="small"
                edge="end"
                disableRipple
                onClick={handleMenu}
                sx={{
                  // -- keep it compact
                  width: 28,
                  height: 28,
                  p: 0.5,
                  borderRadius: "50%",
                  "&:hover": {
                    backgroundColor: "action.hover", // subtle, uses theme value
                  },
                }}
              >
                <MoreVertical size={18} />
              </IconButton>

              <Menu anchorEl={anchorEl} open={openMenu} onClose={closeMenu}>
                <MenuItem
                  onClick={() => {
                    closeMenu();
                    onStartEdit(comment.id);
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMenu();
                    setTimeout(() => {
                      onDelete(comment.id);
                    }, 0);
                  }}
                >
                  Delete
                </MenuItem>
              </Menu>
            </>
          )}
        </div>

        {/* ▶️  INLINE REPLY INPUT  */}
        {showThread && depth < MAX_REPLY_DEPTH && (
          <div
            className="flex flex-col gap-1 mb-3"
            style={{ marginLeft: INDENT }}
          >
            {/* A.  View / Hide button (only for true older replies) */}
            {showToggle && (
              <button
                onClick={toggleReplies}
                disabled={loading && !showReplies}
                className="flex items-center gap-1 text-xs text-blue-600 disabled:text-neutral-400 dark:text-blue-200"
              >
                {loading && !showReplies ? (
                  <CircularProgress size={14} />
                ) : showReplies ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
                {showReplies ? "Hide" : "View"} {olderCount}{" "}
                {olderCount === 1 ? "reply" : "replies"}
              </button>
            )}

            {/* C.  Render replies (older + fresh) */}
            {comment.replies
              ?.filter((r) => showReplies || freshIds.has(r.id))
              .sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime(),
              )
              .map((r) => (
                <CommentRow
                  key={r.id}
                  targetId={targetId}
                  isHighlighted={highlightedCommentId === r.id} // Compare number with number
                  highlightedCommentId={highlightedCommentId} // Pass down number | null
                  targetType={targetType}
                  depth={depth + 1}
                  comment={r}
                  onLike={onLike}
                  onReply={onReply}
                  onDelete={onDelete}
                  onRepliesFetched={onRepliesFetched}
                  editingId={editingId}
                  onStartEdit={onStartEdit}
                  onAbortEdit={onAbortEdit}
                  onCommitEdit={onCommitEdit}
                  onSubmitReply={onSubmitReply}
                />
              ))}
          </div>
        )}
        {/* B.  Inline-reply input - MOVED HERE and corrected indentation & styling */}
        {replying && canReplyToThisComment && (
          <div
            className="flex items-start gap-3 mt-2"
            style={{ marginLeft: INDENT }} // Apply indent directly to the reply box container
          >
            {/* avatar */}
            {user?.profile_picture_url ? (
              <img
                src={user.profile_picture_url}
                alt={user.username}
                className="object-cover w-8 h-8 rounded-full"
              />
            ) : (
              <Avatar
                name={user?.username || "Guest"}
                size={32}
                variant="beam"
                colors={["#84bfc3", "#ff9b62", "#d96153"]}
              />
            )}
            {/* input + buttons */}
            <div className="flex flex-col flex-1 pr-4">
              <TextareaAutosize
                ref={replyInputRef}
                placeholder="Reply…"
                minRows={1} // Consistent minRows
                maxRows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const txt = replyText.trim();
                    if (!txt) return;
                    // Critical check: ensure parent (this comment) is not temporary
                    if (thisCommentIsTemporary) {
                      showSnackbar(
                        "Cannot submit reply, parent comment is still saving.",
                        "error",
                      );
                      return;
                    }
                    // setShowReplies(true);
                    onSubmitReply(comment.id, txt); // comment.id here MUST be the real persisted ID
                    setReplyText("");
                    setReplying(false);
                  }
                }}
                className="border border-neutral-300 rounded-lg p-3 w-full max-w-full ..."
              />
              <div className="flex justify-end gap-2 mt-1">
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => {
                    setReplyText("");
                    setReplying(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  disabled={!replyText.trim()}
                  onClick={() => {
                    const txt = replyText.trim();
                    if (!txt) return;
                    if (thisCommentIsTemporary) {
                      showSnackbar(
                        "Cannot submit reply, parent comment is still saving.",
                        "error",
                      );
                      return;
                    }
                    //  setShowReplies(true); // keep thread open
                    onSubmitReply(comment.id, txt);
                    setReplyText("");
                    setReplying(false);
                  }}
                >
                  Reply
                </Button>
              </div>
            </div>
          </div>
        )}
      </Box>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */
interface Props {
  comments: CommentUI[];
  /** id of the post or blog we are commenting on */
  targetId: number;
  /** where to show the input bar - defaults to bottom (post layout) */
  inputPosition?: "top" | "bottom";
  /** distinguishes which table to update on the back-end */
  targetType: TargetType;
  onCommentAdded(): void;
  onCommentDeleted(): void;
  /** if true, don’t draw the white rounded box around comments */
  hideWrapper?: boolean;
}

const CommentSection = forwardRef<CommentSectionRef, Props>(
  (
    {
      comments: initial,
      targetId,
      targetType = TargetType.POST,
      inputPosition = "bottom",
      onCommentAdded,
      onCommentDeleted,
      hideWrapper = false,
    },
    _ref,
  ) => {
    const { user } = useUser();
    const { showSnackbar } = useSnackbar();
    const CURRENT_USER_ID = user?.id;
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { postCommentsRef } = useFocusContext();
    const listRef = useRef<HTMLDivElement>(null);
    const [comments, setComments] = useState<CommentUI[]>(initial);
    const [newComment, setNewComment] = useState("");
    const [replyParentId, setReplyParentId] = useState<number | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const requireAuth = useRequireAuth();
    /** replies that were added while the parent thread is still collapsed */
    const STORAGE_KEY = `freshReplies-${targetType}-${targetId}`;
    const [newRepliesMap, setNewRepliesMap] = useState<
      Record<number, Set<number>>
    >(() => {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const obj = JSON.parse(raw) as Record<string, number[]>;
        const out: Record<number, Set<number>> = {};
        Object.entries(obj).forEach(([k, v]) => (out[+k] = new Set(v)));
        return out;
      } catch {
        return {};
      }
    });
    const [highlightedCommentId, setHighlightedCommentId] = useState<
      number | null
    >(null); // Changed string to number

    const focusLogic = useCallback(() => {
      if (!user) {
        showSnackbar(
          "Please login to comment",
          "warning",
          <Button
            size="small"
            color="inherit"
            onClick={() => (window.location.href = "/login")}
          >
            Login
          </Button>,
        );
        return;
      }
      textareaRef.current?.focus();
    }, [user, showSnackbar, textareaRef]);

    const appendFresh = (parentId: number, replyId: number) =>
      setNewRepliesMap((prev) => {
        const set = new Set(prev[parentId] ?? []);
        set.add(replyId);
        return { ...prev, [parentId]: set };
      });

    function mergeTrees(prev: CommentUI[], incoming: CommentUI[]): CommentUI[] {
      return incoming.map((inc) => {
        const old = prev.find((p) => p.id === inc.id);

        // If the server gave us no replies but we already have some, keep them.
        const mergedReplies =
          inc.replies && inc.replies.length > 0
            ? inc.replies
            : (old?.replies ?? []);

        return {
          ...inc,
          replies: mergedReplies.map((r) => r), // shallow-copy for safety
        };
      });
    }

    const replaceTempFreshId = (
      parentId: number,
      tmpId: number,
      realId: number,
    ) =>
      setNewRepliesMap((prev) => {
        const set = new Set(prev[parentId]);
        if (!set.size) return prev;
        set.delete(tmpId);
        set.add(realId);
        return { ...prev, [parentId]: set };
      });

    const clearFresh = (parentId: number) =>
      setNewRepliesMap((prev) => {
        if (!prev[parentId]) return prev;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [parentId]: _, ...rest } = prev;
        return rest;
      });
    useEffect(() => {
      setComments((prev) => mergeTrees(prev, initial));
    }, [initial]);

    useImperativeHandle(
      _ref,
      () => ({
        highlightComment: (commentId: number) => {
          console.log("[CommentSection] Highlighting comment:", commentId);
          console.log(
            "[CommentSection] Current highlightedCommentId before:",
            highlightedCommentId,
          );

          // Check if the comment exists in the current comments
          const findComment = (comments: CommentUI[], id: number): boolean => {
            for (const comment of comments) {
              if (comment.id === id) return true;
              if (comment.replies && findComment(comment.replies, id))
                return true;
            }
            return false;
          };

          const commentExists = findComment(comments, commentId);
          console.log(
            "[CommentSection] Comment exists in current comments:",
            commentExists,
          );

          setHighlightedCommentId(commentId);
          console.log(
            "[CommentSection] Setting highlightedCommentId to:",
            commentId,
          );
          setTimeout(() => {
            console.log("[CommentSection] Removing highlight after 5 seconds");
            setHighlightedCommentId(null);
          }, 5000);
        },
        focusCommentInput: () => {
          focusLogic();
        },
        getScrollContainer: () => {
          // Find the scroll container in the desktop layout
          const sidebarContainer = document.querySelector(".sidebar");
          if (sidebarContainer) {
            return sidebarContainer as HTMLElement;
          }

          // Fallback: look for any scrollable container
          const scrollableContainer = document.querySelector(
            '[class*="overflow-y-auto"], .overflow-y-scroll',
          );
          if (scrollableContainer) {
            return scrollableContainer as HTMLElement;
          }

          // Final fallback: return the window/document element
          return document.documentElement;
        },
        scrollToComment: async (
          commentId: number,
          highlight: boolean = true,
        ) => {
          console.log("[CommentSection] === ENHANCED SCROLL START ===");
          console.log(
            "[CommentSection] Target:",
            commentId,
            "highlight:",
            highlight,
          );

          // Find the element
          const element = document.getElementById(`comment-${commentId}`);
          if (!element) {
            console.error(
              "[CommentSection] ❌ Element not found:",
              `comment-${commentId}`,
            );

            // Show available elements for debugging
            const allComments = document.querySelectorAll('[id^="comment-"]');
            console.log(
              "[CommentSection] Available comments:",
              Array.from(allComments).map((el) => el.id),
            );
            return false;
          }

          console.log("[CommentSection] ✅ Element found:", element);

          // Check visibility and dimensions
          const rect = element.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0;
          const computedStyle = window.getComputedStyle(element);

          console.log("[CommentSection] Element analysis:", {
            rect: rect,
            isVisible: isVisible,
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            overflow: computedStyle.overflow,
            position: computedStyle.position,
          });

          // If element is not visible, try to expand parent threads first
          if (!isVisible) {
            console.log(
              "[CommentSection] 🔍 Element not visible, trying to expand parent threads...",
            );

            try {
              // Try to expand all collapsed threads that might contain this comment
              const allToggleButtons = document.querySelectorAll("button");
              let expandedAny = false;

              for (const button of allToggleButtons) {
                const buttonText = button.textContent?.toLowerCase() || "";
                const hasViewText =
                  buttonText.includes("view") &&
                  (buttonText.includes("repl") ||
                    buttonText.includes("comment"));
                const hasChevronDown = button.querySelector(
                  'svg[data-lucide="chevron-down"]',
                );

                if (hasViewText || hasChevronDown) {
                  console.log(
                    "[CommentSection] 🔄 Expanding thread with button:",
                    buttonText,
                  );
                  button.click();
                  expandedAny = true;

                  // Wait for expansion animation
                  await new Promise((resolve) => setTimeout(resolve, 300));

                  // Check if our target is now visible
                  const newRect = element.getBoundingClientRect();
                  if (newRect.width > 0 && newRect.height > 0) {
                    console.log(
                      "[CommentSection] ✅ Target element now visible after expansion",
                    );
                    break;
                  }
                }
              }

              if (expandedAny) {
                // Wait a bit more for all expansions to complete
                await new Promise((resolve) => setTimeout(resolve, 500));
              }
            } catch (error) {
              console.error("[CommentSection] Error expanding threads:", error);
            }
          }

          // Re-check visibility after potential expansions
          const finalRect = element.getBoundingClientRect();
          const finalVisible = finalRect.width > 0 && finalRect.height > 0;

          console.log("[CommentSection] Final visibility check:", {
            rect: finalRect,
            isVisible: finalVisible,
          });

          if (!finalVisible) {
            console.warn(
              "[CommentSection] ⚠️ Element still not visible after expansion attempts",
            );

            // Try forcing the element to be visible
            console.log(
              "[CommentSection] 🔧 Attempting to force visibility...",
            );
            element.style.display = "block";
            element.style.visibility = "visible";
            element.style.opacity = "1";

            // Check parent containers
            let parent = element.parentElement;
            while (parent && parent !== document.body) {
              const parentStyle = window.getComputedStyle(parent);
              if (
                parentStyle.display === "none" ||
                parentStyle.visibility === "hidden"
              ) {
                console.log(
                  "[CommentSection] 🔧 Found hidden parent, making visible:",
                  parent,
                );
                parent.style.display = "block";
                parent.style.visibility = "visible";
              }
              parent = parent.parentElement;
            }

            // Wait for styles to apply
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // Final attempt to scroll
          console.log("[CommentSection] 🚀 Attempting scroll...");

          try {
            // Method 1: scrollIntoView
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });

            console.log("[CommentSection] ✅ scrollIntoView called");

            // Method 2: Manual scroll as backup
            setTimeout(() => {
              const afterScrollRect = element.getBoundingClientRect();
              console.log(
                "[CommentSection] After scroll check:",
                afterScrollRect,
              );

              if (
                afterScrollRect.top < 0 ||
                afterScrollRect.top > window.innerHeight
              ) {
                console.log(
                  "[CommentSection] 🔄 Element not in view, trying manual scroll...",
                );

                const elementTop = afterScrollRect.top + window.pageYOffset;
                const targetY = elementTop - window.innerHeight / 2;

                window.scrollTo({
                  top: Math.max(0, targetY),
                  behavior: "smooth",
                });

                console.log("[CommentSection] ✅ Manual scroll executed");
              }
            }, 1000);
          } catch (error) {
            console.error("[CommentSection] ❌ Scroll failed:", error);
            return false;
          }

          // Add highlight
          if (highlight) {
            console.log("[CommentSection] 🎨 Adding highlight");
            setHighlightedCommentId(commentId);
            setTimeout(() => setHighlightedCommentId(null), 5000);
          }

          console.log("[CommentSection] === ENHANCED SCROLL END ===");
          return true;
        },
        // Debug helper function for testing in console
        debugScrollToComment: (commentId: number) => {
          console.log(
            "[CommentSection] DEBUG: Testing scroll to comment",
            commentId,
          );
          const element = document.getElementById(`comment-${commentId}`);
          if (element) {
            console.log(
              "[CommentSection] DEBUG: Element found, using scrollIntoView",
            );
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.style.backgroundColor = "#ffeb3b";
            setTimeout(() => {
              element.style.backgroundColor = "";
            }, 3000);
          } else {
            console.log("[CommentSection] DEBUG: Element not found");
          }
        },
        expandToComment: async (commentId: number) => {
          console.log("[CommentSection] Expanding to show comment:", commentId);

          // Function to recursively find the path to the target comment and expand all parent threads
          const findCommentPath = (
            commentsList: CommentUI[],
            targetId: number,
            path: number[] = [],
          ): number[] | null => {
            for (const comment of commentsList) {
              const currentPath = [...path, comment.id];

              // If this is the target comment, return the path
              if (comment.id === targetId) {
                return currentPath;
              }

              // Search in replies
              if (comment.replies && comment.replies.length > 0) {
                const foundPath = findCommentPath(
                  comment.replies,
                  targetId,
                  currentPath,
                );
                if (foundPath) {
                  return foundPath;
                }
              }
            }
            return null;
          };

          // First, check if the comment exists in the DOM (might be hidden due to collapsed parent)
          const targetElement = document.getElementById(`comment-${commentId}`);
          if (!targetElement) {
            console.log(
              "[CommentSection] Target comment element not found in DOM, trying to expand all collapsed threads",
            );

            // If the target comment is not in the DOM, we need to expand all collapsed threads
            // to make sure all comments are loaded and visible
            const expandAllCollapsedThreads = async (): Promise<boolean> => {
              let expandedAny = false;
              const allToggleButtons = document.querySelectorAll(
                "button.text-blue-600:not([disabled]), button.dark\\:text-blue-200:not([disabled])",
              );

              for (const button of allToggleButtons) {
                const toggleButton = button as HTMLButtonElement;
                if (toggleButton.textContent) {
                  const buttonText = toggleButton.textContent.toLowerCase();
                  const hasViewText =
                    buttonText.includes("view") &&
                    (buttonText.includes("repl") ||
                      buttonText.includes("comment"));
                  const hasChevronDown = toggleButton.querySelector(
                    'svg[data-lucide="chevron-down"]',
                  );

                  if (hasViewText || hasChevronDown) {
                    console.log(
                      "[CommentSection] Expanding collapsed thread with button text:",
                      buttonText,
                    );
                    toggleButton.click();
                    expandedAny = true;
                    // Wait for the expansion animation
                    await new Promise((resolve) => setTimeout(resolve, 500));
                  }
                }
              }
              return expandedAny;
            };

            const wasExpanded = await expandAllCollapsedThreads();
            console.log(
              "[CommentSection] Expanded all collapsed threads, expandedAny:",
              wasExpanded,
            );
            return wasExpanded;
          }

          // Find the path to the target comment
          const commentPath = findCommentPath(comments, commentId);
          console.log("[CommentSection] Comment path:", commentPath);

          if (!commentPath) {
            console.log(
              "[CommentSection] Comment not found in comment tree, but element exists in DOM",
            );
            // The comment exists in DOM but not in our tree, probably because parent threads are collapsed
            // Try to expand all collapsed threads
            const allToggleButtons = document.querySelectorAll(
              "button.text-blue-600:not([disabled]), button.dark\\:text-blue-200:not([disabled])",
            );
            let expandedAny = false;

            for (const button of allToggleButtons) {
              const toggleButton = button as HTMLButtonElement;
              if (toggleButton.textContent) {
                const buttonText = toggleButton.textContent.toLowerCase();
                const hasViewText =
                  buttonText.includes("view") &&
                  (buttonText.includes("repl") ||
                    buttonText.includes("comment"));
                const hasChevronDown = toggleButton.querySelector(
                  'svg[data-lucide="chevron-down"]',
                );

                if (hasViewText || hasChevronDown) {
                  console.log("[CommentSection] Expanding collapsed thread");
                  toggleButton.click();
                  expandedAny = true;
                  await new Promise((resolve) => setTimeout(resolve, 400));
                }
              }
            }

            return expandedAny;
          }

          if (commentPath.length <= 1) {
            console.log(
              "[CommentSection] Comment is top-level, no expansion needed",
            );
            return false;
          }

          // Function to expand a single parent thread
          const expandParentThread = (parentId: number): boolean => {
            const parentElement = document.getElementById(
              `comment-${parentId}`,
            );
            if (parentElement) {
              // Look for the toggle button that shows/hides replies - more specific selector
              const toggleButton = parentElement.querySelector(
                "button.text-blue-600:not([disabled]), button.dark\\:text-blue-200:not([disabled])",
              ) as HTMLButtonElement;
              if (toggleButton && toggleButton.textContent) {
                const buttonText = toggleButton.textContent.toLowerCase();
                // Check for "view" text and SVG chevron down icon
                const hasViewText =
                  buttonText.includes("view") &&
                  (buttonText.includes("repl") ||
                    buttonText.includes("comment"));
                const hasChevronDown = toggleButton.querySelector(
                  'svg[data-lucide="chevron-down"]',
                );

                if (hasViewText || hasChevronDown) {
                  console.log(
                    "[CommentSection] Found collapsed thread, expanding parent:",
                    parentId,
                    "button text:",
                    buttonText,
                  );
                  toggleButton.click();
                  return true;
                } else {
                  console.log(
                    "[CommentSection] Toggle button found but already expanded for parent:",
                    parentId,
                    "button text:",
                    buttonText,
                  );
                }
              } else {
                console.log(
                  "[CommentSection] No toggle button found for parent:",
                  parentId,
                );
              }
            } else {
              console.log(
                "[CommentSection] Parent element not found:",
                parentId,
              );
            }
            return false;
          };

          // Expand all parent threads sequentially (except the last one which is the target comment)
          let expandedAny = false;

          for (let i = 0; i < commentPath.length - 1; i++) {
            const parentId = commentPath[i];
            const wasExpanded = expandParentThread(parentId);

            if (wasExpanded) {
              expandedAny = true;
              // Wait for the expansion animation before continuing
              await new Promise((resolve) => setTimeout(resolve, 400));
            }
          }

          console.log(
            "[CommentSection] Expansion complete, expandedAny:",
            expandedAny,
          );
          return expandedAny;
        },
      }),
      [focusLogic, highlightedCommentId, comments],
    );

    // Also expose to context ref if needed
    useImperativeHandle(
      postCommentsRef,
      () => ({
        focusCommentInput: focusLogic,
        highlightComment: (commentId: number) => {
          // Changed string to number
          setHighlightedCommentId(commentId);
          setTimeout(() => {
            setHighlightedCommentId(null);
          }, 5000);
        },
        scrollToComment: async (
          commentId: number,
          highlight: boolean = true,
        ) => {
          // Use the same implementation as the main ref
          const commentElement = document.getElementById(
            `comment-${commentId}`,
          );
          if (!commentElement) {
            console.warn(
              "[CommentSection] Comment element not found:",
              `comment-${commentId}`,
            );
            return false;
          }

          commentElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });

          if (highlight) {
            setHighlightedCommentId(commentId);
            setTimeout(() => {
              setHighlightedCommentId(null);
            }, 5000);
          }

          return true;
        },
      }),
      [focusLogic],
    );

    const attachReplies = (id: number, replies: CommentUI[]) => {
      setComments((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, replies }
            : c.replies?.length
              ? { ...c, replies: attachRepliesTo(c.replies, id, replies) }
              : c,
        ),
      );
    };

    const attachRepliesTo = (
      list: CommentUI[],
      id: number,
      replies: CommentUI[],
    ): CommentUI[] =>
      list.map((c) =>
        c.id === id
          ? { ...c, replies }
          : c.replies?.length
            ? { ...c, replies: attachRepliesTo(c.replies, id, replies) }
            : c,
      );

    /* -------------------- CREATE ---------------------------------- */
    const handleAdd = async (
      contentArg?: string,
      parentIdArg?: number | null,
    ) => {
      const content = (contentArg ?? newComment).trim();
      if (!content) return;

      const parentId = parentIdArg !== undefined ? parentIdArg : replyParentId;

      const tmpId = Date.now();
      const now = new Date();

      const optimistic: CommentUI = {
        id: tmpId,
        user_id: CURRENT_USER_ID || "",
        user: {
          id: CURRENT_USER_ID!,
          username: user?.username || "",
          profile_picture_url: user?.profile_picture_url,
        } as User,
        parent_comment_id: parentId ?? null,
        target_id: targetId,
        target_type: targetType,
        content,
        created_at: now,
        updated_at: now,
        replies: [],
        like_count: 0,
        likedByCurrentUser: false,
        reply_count: 0,
      };

      // Optimistically update UI to show the new reply (and bump reply_count)
      setComments((prev) =>
        parentId
          ? addReplyRecursive(prev, parentId, optimistic)
          : [optimistic, ...prev],
      );

      // mark this reply so it stays visible even if thread is collapsed
      if (parentId) appendFresh(parentId, tmpId);
      listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      // Clear input and set states
      setNewComment("");
      setReplyParentId(null);
      setIsPosting(true);

      try {
        const payload: CreateCommentDto = {
          content,
          target_id: targetId,
          target_type: targetType,
          parent_comment_id: parentId ?? undefined,
        };

        const { data } = await createComment(payload);

        // Replace the optimistic comment while preserving hierarchy
        if (parentId) {
          // For replies, update within the nested structure
          setComments((prev) =>
            prev.map((comment) => {
              if (comment.id === parentId) {
                // Replace the temp reply with the real one in this parent
                return {
                  ...comment,
                  replies:
                    comment.replies?.map((reply) =>
                      reply.id === tmpId ? data : reply,
                    ) || [],
                };
              } else if (comment.replies?.length) {
                // Search deeper in the tree
                return {
                  ...comment,
                  replies: updateReplyInNestedStructure(
                    comment.replies,
                    parentId,
                    tmpId,
                    data,
                  ),
                };
              }
              return comment;
            }),
          );
        } else {
          // For top-level comments, replace the temp one with the real one
          setComments((prev) => prev.map((c) => (c.id === tmpId ? data : c)));
        }

        // update fresh-reply map from tmpId ➜ real id
        if (parentId) replaceTempFreshId(parentId, tmpId, data.id);

        setTimeout(() => {
          if (parentId) {
            const parentEl = document.getElementById(`comment-${parentId}`);
            if (parentEl) {
              parentEl.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          } else {
            listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, 100);
        setReplyParentId(null);
        onCommentAdded();
      } catch (err) {
        console.error(err);
        setComments((prev) => removeRecursive(prev, tmpId));
        showSnackbar("Failed to post comment", "error");
      } finally {
        setIsPosting(false);
      }
    };

    const updateReplyInNestedStructure = (
      replies: CommentUI[],
      parentId: number,
      tmpId: number,
      newData: CommentUI,
    ): CommentUI[] => {
      return replies.map((reply) => {
        if (reply.id === parentId) {
          return {
            ...reply,
            replies:
              reply.replies?.map((r) => (r.id === tmpId ? newData : r)) || [],
          };
        } else if (reply.replies?.length) {
          return {
            ...reply,
            replies: updateReplyInNestedStructure(
              reply.replies,
              parentId,
              tmpId,
              newData,
            ),
          };
        }
        return reply;
      });
    };

    /* -------------------- DELETE ---------------------------------- */
    const handleDelete = async (id: number) => {
      const prev = comments;
      setComments(removeRecursive(prev, id));
      setDeletingId(id);
      try {
        await api.delete(`/comments/${id}`);
        onCommentDeleted();
      } catch (err) {
        console.error(err);
        setComments(prev);
        showSnackbar("Could not delete comment", "error");
      } finally {
        setDeletingId(null);
      }
    };

    /* -------------------- EDIT ------------------------------------ */
    const startEdit = (id: number) => setEditingId(id);
    const abortEdit = () => setEditingId(null);

    const commitEdit = async (id: number, value: string) => {
      if (!value) return;
      const prev = comments;
      setComments(updateContentRecursive(prev, id, value));
      setEditingId(null);
      try {
        await api.patch(`/comments/${id}`, { content: value });
      } catch (err) {
        console.error(err);
        setComments(prev);
        showSnackbar("Could not update comment", "error");
      }
    };

    /* -------------------- LIKE ------------------------------------ */
    const [likingComments, setLikingComments] = useState<Set<number>>(
      new Set(),
    );

    const handleLike = async (id: number) => {
      // Prevent multiple simultaneous like operations on the same comment
      if (likingComments.has(id)) {
        return;
      }

      const comment = comments
        .flatMap(function findAll(c): CommentUI[] {
          return [c, ...(c.replies ? c.replies.flatMap(findAll) : [])];
        })
        .find((c) => c.id === id);

      const alreadyLiked = comment?.likedByCurrentUser;

      // Mark this comment as being processed
      setLikingComments((prev) => new Set(prev).add(id));

      // Optimistically update UI
      setComments((prev) => toggleLikeRecursive(prev, id));

      try {
        if (alreadyLiked) {
          await unlikeComment(id);
        } else {
          await likeComment(id);
        }
      } catch (err) {
        console.error(err);
        // Revert the optimistic update on error
        setComments((prev) => toggleLikeRecursive(prev, id));
        showSnackbar("Failed to update like", "error");
      } finally {
        // Remove the comment from the processing set
        setLikingComments((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    };

    /* -------------------- FETCH ----------------------------------- */
    useEffect(() => {
      const loadComments = async () => {
        try {
          const data = await fetchComments(targetId, targetType);
          setComments(data as CommentUI[]);
        } catch (err) {
          console.error("Failed to load comments:", err);
          showSnackbar("Failed to load comments", "error");
        }
      };
      if (targetId) {
        loadComments();
      }
    }, [targetId, showSnackbar, targetType]);

    const InputBar = (
      <div
        className={
          inputPosition === "bottom"
            ? // Fixed bottom: absolute positioning, ensure dark mode
              "sticky bottom-0  inset-x-0 bottom-0 flex items-center gap-2 bg-white dark:bg-mountain-950 p-4 border-t border-mountain-200 dark:border-mountain-700"
            : // top version, but if hideWrapper remove border & rounding
              hideWrapper
              ? "flex items-center gap-2 bg-white dark:bg-mountain-950 mb-4 px-4 mt-3" // blog comments
              : "flex items-center gap-2 bg-white dark:bg-mountain-950 p-4 border border-mountain-200 dark:border-mountain-700 rounded-lg mb-4"
        }
      >
        {/* Avatar */}
        {user?.profile_picture_url ? (
          <img
            src={user.profile_picture_url}
            alt={user.username}
            className="object-cover w-8 h-8 rounded-full"
          />
        ) : (
          <Avatar
            name={user?.username || "Guest"}
            size={32}
            variant="beam"
            colors={["#84bfc3", "#ff9b62", "#d96153"]}
          />
        )}

        {/* Text input + Send button */}
        <div className="flex flex-grow gap-2">
          <TextareaAutosize
            ref={textareaRef}
            placeholder={
              user
                ? replyParentId
                  ? "Replying…"
                  : "Add a comment"
                : "Login to add a comment"
            }
            className="w-full p-3 border rounded-lg resize-none border-neutral-300 dark:border-neutral-600 bg-white dark:bg-mountain-900 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isPosting || !user}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                newComment.trim() && requireAuth("comment", handleAdd);
              }
            }}
          />

          <Button
            variant="contained"
            className="p-0.5 min-w-auto h-12 aspect-[1/1]"
            onClick={() => requireAuth("comment", handleAdd)}
            disabled={!newComment.trim() || isPosting || !user}
          >
            {isPosting ? <CircularProgress size={24} /> : <SendHorizontal />}
          </Button>
        </div>
      </div>
    );

    const baseWrapperClasses = "relative flex flex-col w-full";
    const responsiveGrowClass = "md:flex-grow";
    const conditionalAppearanceClasses = !hideWrapper
      ? "bg-white dark:bg-mountain-950 rounded-2xl"
      : "";

    const wrapperClass =
      `${baseWrapperClasses} ${responsiveGrowClass} ${conditionalAppearanceClasses}`
        .trim()
        .replace(/\s+/g, " ");

    return (
      <div className={wrapperClass}>
        <span className="px-4 pt-4 font-bold text-md dark:text-white">
          Comments
        </span>
        {inputPosition === "top" && InputBar}
        <FreshRepliesCtx.Provider
          value={{ map: newRepliesMap, clear: clearFresh }}
        >
          <div
            ref={listRef}
            className={`flex-grow px-4 overflow-x-hidden overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-700 ${
              hideWrapper
                ? ""
                : "bg-white dark:bg-neutral-800 rounded-lg shadow"
            } ${
              inputPosition === "top"
                ? "pb-4" // Add padding to bottom if input is at top
                : "pt-4" // Add padding to top if input is at bottom
            }`}
            style={{ scrollBehavior: "smooth" }}
          >
            {comments.map((c) => (
              <CommentRow
                targetId={targetId}
                targetType={targetType}
                isHighlighted={highlightedCommentId === c.id} // Compare number with number
                highlightedCommentId={highlightedCommentId} // Pass number | null
                key={c.id}
                comment={c}
                onLike={handleLike}
                onSubmitReply={(parentId, content) =>
                  requireAuth("reply to comments", () =>
                    handleAdd(content, parentId),
                  )
                }
                onReply={(id, username) => {
                  setReplyParentId(id);
                  setNewComment(`@${username} `);
                  textareaRef.current?.focus();
                }}
                onDelete={handleDelete}
                onRepliesFetched={attachReplies}
                editingId={editingId}
                onStartEdit={startEdit}
                onAbortEdit={abortEdit}
                onCommitEdit={commitEdit}
              />
            ))}
          </div>
        </FreshRepliesCtx.Provider>
        {inputPosition === "bottom" && InputBar}
        {/* input */}

        {deletingId && (
          <div className="absolute inset-0 flex items-center justify-center text-sm bg-white/70">
            <CircularProgress size={20} />
            <span className="ml-2">Deleting…</span>
          </div>
        )}
      </div>
    );
  },
);

CommentSection.displayName = "PostComments";

// Global debug functions for browser console testing
if (typeof window !== "undefined") {
  // Simple test function accessible from browser console
  (
    window as unknown as Window & {
      testCommentScroll: (commentId: number) => boolean;
    }
  ).testCommentScroll = function (commentId: number) {
    console.log("🧪 === BROWSER CONSOLE TEST ===");
    console.log("🎯 Testing scroll to comment:", commentId);

    const element = document.getElementById(`comment-${commentId}`);
    if (!element) {
      console.error("❌ Element not found:", `comment-${commentId}`);

      // Show available comments
      const allComments = document.querySelectorAll('[id^="comment-"]');
      console.log("📋 Available comments:");
      allComments.forEach((el: Element) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        console.log(
          `  - ${el.id} (visible: ${isVisible}, rect: ${rect.width}x${rect.height})`,
        );
      });
      return false;
    }

    console.log("✅ Element found:", element);

    // Check current dimensions
    const rect = element.getBoundingClientRect();
    console.log("📐 Current dimensions:", {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      visible: rect.width > 0 && rect.height > 0,
    });

    if (rect.width === 0 && rect.height === 0) {
      console.log(
        "⚠️ Element has zero dimensions - trying to expand threads...",
      );

      // Find and click expand buttons
      const buttons = document.querySelectorAll("button");
      let expandedAny = false;

      buttons.forEach((button: Element) => {
        const buttonElement = button as HTMLButtonElement;
        const text = buttonElement.textContent?.toLowerCase() || "";
        const hasViewText =
          text.includes("view") &&
          (text.includes("repl") || text.includes("comment"));
        const hasChevronDown = buttonElement.querySelector(
          'svg[data-lucide="chevron-down"]',
        );

        if (hasViewText || hasChevronDown) {
          console.log("🔄 Clicking expand button:", text);
          buttonElement.click();
          expandedAny = true;
        }
      });

      if (expandedAny) {
        console.log("⏳ Waiting for expansions...");
        setTimeout(() => {
          const newRect = element.getBoundingClientRect();
          console.log("📐 After expansion:", newRect);
          performScroll(element);
        }, 1000);
      } else {
        console.log("🔧 No expand buttons found, forcing visibility...");
        forceVisibility(element);
      }
    } else {
      performScroll(element);
    }

    function forceVisibility(el: HTMLElement) {
      console.log("🔧 Forcing element visibility...");
      el.style.display = "block";
      el.style.visibility = "visible";
      el.style.opacity = "1";

      // Force parent visibility
      let parent = el.parentElement;
      while (parent && parent !== document.body) {
        const parentStyle = window.getComputedStyle(parent);
        if (
          parentStyle.display === "none" ||
          parentStyle.visibility === "hidden"
        ) {
          console.log("🔧 Making parent visible:", parent.tagName);
          (parent as HTMLElement).style.display = "block";
          (parent as HTMLElement).style.visibility = "visible";
        }
        parent = parent.parentElement;
      }

      setTimeout(() => performScroll(el), 500);
    }

    function performScroll(el: HTMLElement) {
      console.log("🚀 Performing scroll...");

      // Add visual highlight
      const originalBg = el.style.backgroundColor;
      const originalBorder = el.style.border;

      el.style.backgroundColor = "#ffeb3b";
      el.style.border = "3px solid #f44336";
      el.style.transition = "all 0.3s ease";

      console.log("🎨 Added highlight");

      // Scroll to element
      try {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
        console.log("✅ scrollIntoView called");

        // Verify scroll after delay
        setTimeout(() => {
          const finalRect = el.getBoundingClientRect();
          console.log("📍 Final position:", finalRect.top);

          if (finalRect.top < 50 || finalRect.top > window.innerHeight - 50) {
            console.log("🔄 Adjusting scroll position...");
            const targetY =
              finalRect.top + window.pageYOffset - window.innerHeight / 2;
            window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
          }

          console.log("✅ Scroll test completed");
        }, 1000);
      } catch (error) {
        console.error("❌ Scroll failed:", error);
      }

      // Remove highlight
      setTimeout(() => {
        el.style.backgroundColor = originalBg;
        el.style.border = originalBorder;
        console.log("🧹 Removed highlight");
        console.log("🧪 === TEST COMPLETE ===");
      }, 4000);
    }

    return true;
  };

  // List available comments function
  (window as unknown as Window & { listComments: () => void }).listComments =
    function () {
      console.log("📋 === AVAILABLE COMMENTS ===");
      const comments = document.querySelectorAll('[id^="comment-"]');

      if (comments.length === 0) {
        console.log("❌ No comment elements found");
        return;
      }

      comments.forEach((el: Element, index: number) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const commentId = el.id.replace("comment-", "");

        console.log(
          `${index + 1}. Comment ${commentId} - Visible: ${isVisible} - Dimensions: ${rect.width}x${rect.height} - Top: ${rect.top}`,
        );
      });

      console.log("💡 Use: testCommentScroll(24) to test scrolling");
    };

  console.log("🧪 Comment scroll test functions loaded!");
  console.log("Available functions:");
  console.log("- testCommentScroll(commentId) - Test scrolling to a comment");
  console.log("- listComments() - List all available comments");
}

export default CommentSection;
