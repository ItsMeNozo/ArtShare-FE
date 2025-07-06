import { TargetType } from "@/utils/constants.ts";
import { CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { fetchComments } from "./api/comment.api.ts";
import CommentSection, {
  CommentSectionRef,
} from "./components/CommentSection.tsx";
import MatureContentWarning from "./components/MatureContentWarning.tsx";
import PostArtist from "./components/PostArtist";
import PostAssets from "./components/PostAssets";
import PostInfo from "./components/PostInfo";
import { useGetPostDetails } from "./hooks/useGetPostDetails.tsx";

const Post: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const commentSectionRef = useRef<CommentSectionRef>(null);
  const location = useLocation();

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);
  const [showMatureContent, setShowMatureContent] = useState<boolean>(false);

  const numericPostId = postId ? parseInt(postId, 10) : NaN;
  const scrollAttemptedRef = useRef(false);
  const {
    data: postData,
    isLoading: isPostLoading,
    error: postError,
    refetch: refetchPostData,
  } = useGetPostDetails(numericPostId);

  const {
    data: comments,
    isLoading: isCommentsLoading,
    error: commentsError,
  } = useQuery({
    queryKey: ["comments", numericPostId],
    queryFn: async () => {
      if (isNaN(numericPostId)) {
        throw new Error("Invalid Post ID format for comments");
      }

      const commentsData = await fetchComments(numericPostId);
      if (commentsData === undefined || commentsData === null) {
        throw new Error("Failed to fetch comments or comments data is empty");
      }
      return commentsData;
    },
    enabled: !!postId && !isNaN(numericPostId),
  });

  const [commentCount, setCommentCount] = useState<number>(0);

  useEffect(() => {
    console.log("[Post] useEffect triggered");
    console.log("[Post] location.state:", location.state);
    console.log("[Post] isCommentsLoading:", isCommentsLoading);
    console.log("[Post] comments:", comments ? "loaded" : "not loaded");
    console.log(
      "[Post] commentSectionRef.current:",
      commentSectionRef.current ? "exists" : "null",
    );
    console.log(
      "[Post] scrollAttemptedRef.current:",
      scrollAttemptedRef.current,
    );

    const rawHighlightIdFromState = location.state?.highlightCommentId;
    const shouldScroll = location.state?.scrollToComment;

    if (rawHighlightIdFromState && shouldScroll) {
      console.log(
        "[Post] Resetting scrollAttemptedRef due to new navigation state",
      );
      scrollAttemptedRef.current = false;
    }

    let highlightId: number | undefined = undefined;

    if (typeof rawHighlightIdFromState === "string") {
      const parsedId = parseInt(rawHighlightIdFromState, 10);
      if (!isNaN(parsedId)) {
        highlightId = parsedId;
      }
    } else if (typeof rawHighlightIdFromState === "number") {
      highlightId = rawHighlightIdFromState;
    }

    if (
      highlightId === undefined ||
      !shouldScroll ||
      isCommentsLoading ||
      !comments ||
      !commentSectionRef.current ||
      scrollAttemptedRef.current
    ) {
      return;
    }

    scrollAttemptedRef.current = true;

    window.history.replaceState(
      {
        ...window.history.state,
        highlightCommentId: undefined,
        scrollToComment: undefined,
      },
      document.title,
    );

    const timer = setTimeout(() => {
      console.log("[Post] About to call highlightComment with:", highlightId);
      console.log(
        "[Post] commentSectionRef.current:",
        commentSectionRef.current,
      );
      commentSectionRef.current?.highlightComment(highlightId!);
      console.log("[Post] Called highlightComment");

      setTimeout(async () => {
        console.log(
          "[Post] Looking for element with ID:",
          `comment-${highlightId}`,
        );
        const element = document.getElementById(`comment-${highlightId}`);
        console.log("[Post] Found element:", element);

        if (element) {
          console.log(
            "[Post] Element position before scroll:",
            element.getBoundingClientRect(),
          );
          console.log("[Post] Viewport height:", window.innerHeight);
          console.log("[Post] Current window scroll position:", {
            scrollX: window.scrollX,
            scrollY: window.scrollY,
          });
          console.log("[Post] Document dimensions:", {
            documentHeight: document.documentElement.scrollHeight,
            documentWidth: document.documentElement.scrollWidth,
            clientHeight: document.documentElement.clientHeight,
            clientWidth: document.documentElement.clientWidth,
          });

          const rect = element.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) {
            console.log(
              "[Post] Element appears to be hidden/collapsed, trying to expand parent thread",
            );

            try {
              const wasExpanded =
                await commentSectionRef.current?.expandToComment(highlightId);

              if (wasExpanded) {
                console.log(
                  "[Post] Successfully expanded parent thread, scrolling to comment",
                );

                setTimeout(() => {
                  const updatedRect = element.getBoundingClientRect();
                  console.log(
                    "[Post] After expansion, element rect:",
                    updatedRect,
                  );

                  if (updatedRect.width > 0 && updatedRect.height > 0) {
                    console.log(
                      "[Post] Element is now visible, using scrollToComment method...",
                    );
                    commentSectionRef.current?.scrollToComment(
                      highlightId,
                      false,
                    );
                  } else {
                    console.warn(
                      "[Post] Element still not visible after expansion",
                    );
                  }
                }, 300);
              } else {
                console.warn("[Post] Could not find parent thread to expand");
              }
            } catch (error) {
              console.error("[Post] Error expanding comment thread:", error);
            }
          } else {
            console.log(
              "[Post] Element is visible, using scrollToComment method...",
            );
            console.log("[Post] Element computed style:", {
              display: window.getComputedStyle(element).display,
              visibility: window.getComputedStyle(element).visibility,
              opacity: window.getComputedStyle(element).opacity,
              position: window.getComputedStyle(element).position,
            });

            try {
              const scrollSuccess =
                await commentSectionRef.current?.scrollToComment(
                  highlightId,
                  false,
                );
              console.log("[Post] scrollToComment result:", scrollSuccess);

              if (!scrollSuccess) {
                console.warn(
                  "[Post] scrollToComment failed, falling back to scrollIntoView",
                );
                const isDesktop = window.innerWidth >= 768;
                if (isDesktop) {
                  console.log("[Post] Desktop - using fallback scrollIntoView");
                  element.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "nearest",
                  });
                } else {
                  console.log("[Post] Mobile - using fallback scrollIntoView");
                  element.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
              }
            } catch (error) {
              console.error("[Post] Error calling scrollToComment:", error);
              console.log("[Post] Falling back to scrollIntoView");
              element.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }

          setTimeout(() => {
            console.log(
              "[Post] Element position after scroll:",
              element.getBoundingClientRect(),
            );
            console.log("[Post] Window scroll position after scroll:", {
              scrollX: window.scrollX,
              scrollY: window.scrollY,
            });
          }, 2000);
        } else {
          console.warn(
            "[Post] Could not find comment element with ID:",
            `comment-${highlightId}`,
          );
        }
      }, 300);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.state, comments, isCommentsLoading]);

  useEffect(() => {
    if (postData) {
      setCommentCount(postData.comment_count);
      setShowMatureContent(!postData.is_mature);
    }
  }, [postData]);

  const handleCommentAdded = () => {
    setCommentCount((prev) => prev + 1);
    if (postData) {
      postData.comment_count += 1;
      refetchPostData();
    }
  };
  const handleCommentDeleted = () => {
    setCommentCount((prev) => Math.max(prev - 1, 0));
    if (postData) {
      postData.comment_count -= 1;
      refetchPostData();
    }
  };

  const handleShowMatureContent = () => {
    setShowMatureContent(true);
  };

  if (!postId || isNaN(numericPostId)) {
    return (
      <div className="flex justify-center items-center m-4">
        Invalid Post ID.
      </div>
    );
  }

  if (isPostLoading || isCommentsLoading) {
    return (
      <div className="flex justify-center items-center m-4 h-screen text-center">
        <CircularProgress size={36} />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  if (postError) {
    return (
      <div className="flex justify-center items-center m-4">
        Error loading post:{" "}
        {(postError as Error).message || "Failed to fetch post."}
      </div>
    );
  }

  if (commentsError && postData) {
    return (
      <div className="flex justify-center items-center m-4">
        Error loading comments:{" "}
        {(commentsError as Error).message || "Failed to fetch comments."}
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="flex justify-center items-center m-4">
        Post not found or data is unavailable.
      </div>
    );
  }

  if (!comments) {
    return (
      <div className="flex justify-center items-center m-4">
        Comments not found or data is unavailable.
      </div>
    );
  }

  const displayAssets = !postData.is_mature || showMatureContent;

  return (
    <div className="relative flex-grow bg-mountain-50 dark:bg-mountain-950 dark:bg-gradient-to-b dark:from-mountain-1000 dark:to-mountain-950 rounded-t-3xl h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar">
      <div className="md:hidden relative flex flex-col bg-white shadow p-4 rounded-2xl h-full">
        <div className="rounded-2xl h-full overflow-y-auto">
          <PostArtist artist={postData!.user} postData={postData!} />
          {displayAssets ? (
            <PostAssets medias={postData.medias} />
          ) : (
            <MatureContentWarning onShow={handleShowMatureContent} />
          )}
          <PostInfo
            postData={postData}
            commentCount={commentCount}
            setCommentCount={setCommentCount}
          />
          <CommentSection
            ref={commentSectionRef}
            comments={comments!}
            targetId={postData!.id}
            targetType={TargetType.POST}
            onCommentAdded={handleCommentAdded}
            onCommentDeleted={handleCommentDeleted}
          />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-row h-full">
        <div className="flex flex-grow justify-center items-center h-full overflow-hidden">
          {displayAssets ? (
            <PostAssets medias={postData.medias} />
          ) : (
            <MatureContentWarning onShow={handleShowMatureContent} />
          )}
        </div>
        <div className="relative flex-shrink-0 bg-white shadow py-0 pl-4 sm:w-[256px] md:w-[384px] lg:w-[448px] overflow-hidden">
          <div className="flex flex-col gap-4 h-full sidebar">
            <PostArtist artist={postData!.user} postData={postData!} />
            <PostInfo
              postData={postData}
              commentCount={commentCount}
              setCommentCount={setCommentCount}
            />
            <CommentSection
              ref={commentSectionRef}
              comments={comments!}
              targetId={postData!.id}
              targetType={TargetType.POST}
              onCommentAdded={handleCommentAdded}
              onCommentDeleted={handleCommentDeleted}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
