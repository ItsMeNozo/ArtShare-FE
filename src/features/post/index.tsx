import { commentKeys } from '@/lib/react-query/query-keys';
import { TargetType } from '@/utils/constants.ts';
import { CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { fetchComments } from './api/comment.api.ts';
import CommentSection, {
  CommentSectionRef,
} from './components/CommentSection.tsx';
import MatureContentWarning from './components/MatureContentWarning.tsx';
import PostArtist from './components/PostArtist';
import PostAssets from './components/PostAssets';
import PostInfo from './components/PostInfo';
import { useGetPostDetailsForView } from './hooks/useGetPostDetails.tsx';

const Post: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const commentSectionRef = useRef<CommentSectionRef>(null);
  const location = useLocation();

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

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
  } = useGetPostDetailsForView(numericPostId);

  const {
    data: comments,
    isLoading: isCommentsLoading,
    error: commentsError,
  } = useQuery({
    queryKey: commentKeys.byTarget('POST', numericPostId), // Use standardized comment keys
    queryFn: async () => {
      if (isNaN(numericPostId)) {
        throw new Error('Invalid Post ID format for comments');
      }

      const commentsData = await fetchComments(numericPostId, 'POST'); // Explicitly specify targetType
      if (commentsData === undefined || commentsData === null) {
        throw new Error('Failed to fetch comments or comments data is empty');
      }
      return commentsData;
    },
    enabled: !!postId && !isNaN(numericPostId),
    staleTime: 1000 * 60 * 2, // Override global staleTime for comments (2 minutes)
  });

  const [commentCount, setCommentCount] = useState<number>(0);

  useEffect(() => {
    const rawHighlightIdFromState = location.state?.highlightCommentId;
    const shouldScroll = location.state?.scrollToComment;

    if (rawHighlightIdFromState && shouldScroll) {
      scrollAttemptedRef.current = false;
    }

    let highlightId: number | undefined = undefined;

    if (typeof rawHighlightIdFromState === 'string') {
      const parsedId = parseInt(rawHighlightIdFromState, 10);
      if (!isNaN(parsedId)) {
        highlightId = parsedId;
      }
    } else if (typeof rawHighlightIdFromState === 'number') {
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
      commentSectionRef.current?.highlightComment(highlightId!);

      setTimeout(async () => {
        const element = document.getElementById(`comment-${highlightId}`);

        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) {
            try {
              const wasExpanded =
                await commentSectionRef.current?.expandToComment(highlightId);

              if (wasExpanded) {
                setTimeout(() => {
                  commentSectionRef.current?.scrollToComment(
                    highlightId,
                    false,
                  );
                }, 300);
              }
            } catch (error) {
              console.error('[Post] Error expanding comment thread:', error);
            }
          } else {
            try {
              const scrollSuccess =
                await commentSectionRef.current?.scrollToComment(
                  highlightId,
                  false,
                );

              if (!scrollSuccess) {
                const isDesktop = window.innerWidth >= 768;
                element.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                  inline: isDesktop ? 'nearest' : undefined,
                });
              }
            } catch (error) {
              console.error('[Post] Error calling scrollToComment:', error);
              element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
            }
          }
        }
      }, 300);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.state, comments, isCommentsLoading]);

  useEffect(() => {
    if (postData) {
      setCommentCount(postData.commentCount);
      setShowMatureContent(!postData.isMature);
    }
  }, [postData]);

  const handleCommentAdded = () => {
    setCommentCount((prev) => prev + 1);
    if (postData) {
      postData.commentCount += 1;
      refetchPostData();
    }
  };
  const handleCommentDeleted = () => {
    setCommentCount((prev) => Math.max(prev - 1, 0));
    if (postData) {
      postData.commentCount -= 1;
      refetchPostData();
    }
  };

  const handleShowMatureContent = () => {
    setShowMatureContent(true);
  };

  if (!postId || isNaN(numericPostId)) {
    return (
      <div className="m-4 flex items-center justify-center">
        Invalid Post ID.
      </div>
    );
  }

  if (isPostLoading || isCommentsLoading) {
    return (
      <div className="m-4 flex h-screen items-center justify-center text-center">
        <CircularProgress size={36} />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  if (postError) {
    return (
      <div className="m-4 flex items-center justify-center">
        Error loading post:{' '}
        {(postError as Error).message || 'Failed to fetch post.'}
      </div>
    );
  }

  if (commentsError && postData) {
    return (
      <div className="m-4 flex items-center justify-center">
        Error loading comments:{' '}
        {(commentsError as Error).message || 'Failed to fetch comments.'}
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="m-4 flex items-center justify-center">
        Post not found or data is unavailable.
      </div>
    );
  }

  if (!comments) {
    return (
      <div className="m-4 flex items-center justify-center">
        Comments not found or data is unavailable.
      </div>
    );
  }

  const displayAssets = !postData.isMature || showMatureContent;

  return (
    <div className="bg-mountain-50 dark:bg-mountain-950 dark:from-mountain-1000 dark:to-mountain-950 no-scrollbar relative h-[calc(100vh-4rem)] flex-grow overflow-y-auto rounded-t-3xl dark:bg-gradient-to-b">
      <div className="relative flex h-full flex-col rounded-2xl bg-white shadow lg:hidden">
        <div className="custom-scrollbar h-full overflow-y-auto rounded-2xl">
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
            hideWrapper={true}
          />
        </div>
      </div>
      {/* Desktop Layout */}
      <div className="hidden h-full flex-row gap-4 lg:flex">
        <div className="flex h-full flex-grow items-center justify-center">
          {displayAssets ? (
            <PostAssets medias={postData.medias} />
          ) : (
            <MatureContentWarning onShow={handleShowMatureContent} />
          )}
        </div>
        <div className="rounded-lr-3xl dark:bg-mountain-950 custom-scrollbar relative flex-shrink-0 overflow-y-auto bg-white py-0 shadow sm:w-[256px] md:w-[384px] lg:w-[448px]">
          <div className="flex h-full flex-col gap-4">
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
              hideWrapper={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
