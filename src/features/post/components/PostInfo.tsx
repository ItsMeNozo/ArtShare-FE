import { useFocusContext } from '@/contexts/focus/useFocusText';
import { Collection, Post } from '@/types';
import { Button, CardContent, Divider } from '@mui/material';
import { Bookmark, MessageSquareText, Share2 } from 'lucide-react';
import { ElementType, useCallback, useEffect, useState } from 'react';
import ShowMoreText from 'react-show-more-text';
import ReactTimeAgo from 'react-time-ago';

import { CreateCollectionDialog } from '@/features/collection/components/CreateCollectionDialog';
import { SavePostDialog } from './SavePostDialog';

import { LikesDialog } from '@/components/like/LikesDialog';
import { useUser } from '@/contexts/user/useUser';
import { AiFillLike, AiOutlineLike } from 'react-icons/ai';
import { fetchCollectionsForDialog } from '../api/collection.api';
// 👉 Like/unlike API helpers
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useSnackbar } from '@/hooks/useSnackbar';
import { TargetType } from '@/utils/constants';
import { useLocation } from 'react-router-dom';
import { likePost, unlikePost } from '../api/post.api';

interface SimpleCollection {
  id: number;
  name: string;
}

const AnyShowMoreText: ElementType = ShowMoreText as unknown as ElementType;

type PostInfoProps = {
  postData: Post & {
    isLikedByCurrentUser?: boolean;
  };
  commentCount: number; // Accept the comment count as prop
  setCommentCount: React.Dispatch<React.SetStateAction<number>>; // Accept setState function for comment count
};

const PostInfo = ({ postData }: PostInfoProps) => {
  const { postCommentsRef } = useFocusContext();
  const { showSnackbar } = useSnackbar();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLikesDialogOpen, setIsLikesDialogOpen] = useState(false);
  const [simpleCollections, setSimpleCollections] = useState<
    SimpleCollection[]
  >([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const user = useUser();
  // Like-state & API integration
  const [userLike, setUserLike] = useState<boolean>(
    postData.isLikedByCurrentUser ?? false,
  );
  const [likeCount, setLikeCount] = useState<number>(postData.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [isFetchingLike] = useState(false);
  const requireAuth = useRequireAuth();

  useEffect(() => {
    setUserLike(postData.isLikedByCurrentUser ?? false);
    setLikeCount(postData.like_count);
  }, [postData.isLikedByCurrentUser, postData.like_count]);

  useEffect(() => {
    const loadCollectionNames = async () => {
      setIsLoadingCollections(true);
      setCollectionError(null);
      try {
        const fetchedCollections = await fetchCollectionsForDialog();
        setSimpleCollections(fetchedCollections);
      } catch (error) {
        setCollectionError(
          error instanceof Error ? error.message : 'Could not load list.',
        );
      } finally {
        setIsLoadingCollections(false);
      }
    };
    loadCollectionNames();
  }, [postData.id]);

  const handleOpenSaveDialog = () => {
    setIsCreateDialogOpen(false);
    setIsSaveDialogOpen(true);
  };
  const handleCloseSaveDialog = () => setIsSaveDialogOpen(false);

  const handleNavigateToCreate = () => {
    if (isLoadingCollections || collectionError) return;
    setIsSaveDialogOpen(false);
    setIsCreateDialogOpen(true);
  };
  const handleCloseCreateDialog = () => setIsCreateDialogOpen(false);

  const handleCollectionCreated = useCallback(
    (newCollection: Collection) => {
      setSimpleCollections((prev) => [
        ...prev,
        { id: newCollection.id, name: newCollection.name },
      ]);
      if (collectionError) setCollectionError(null);
      setIsCreateDialogOpen(false);
      setIsSaveDialogOpen(true);
    },
    [collectionError],
  );

  // Like / Unlike handler (optimistic update)
  const handleLikeClick = () =>
    requireAuth('like this post', async () => {
      if (!user) {
        showSnackbar('Please log in to like', 'error');
        return;
      }
      if (isLiking || isFetchingLike) return;
      const willLike = !userLike;
      setUserLike(willLike);
      setLikeCount((prev) => (willLike ? prev + 1 : Math.max(prev - 1, 0)));
      setIsLiking(true);
      try {
        willLike ? await likePost(postData.id) : await unlikePost(postData.id);
      } catch (error) {
        console.error('Error toggling like status:', error);
        setUserLike(!willLike);
        setLikeCount((prev) => (willLike ? Math.max(prev - 1, 0) : prev + 1));
      } finally {
        setIsLiking(false);
      }
    });

  const handleOpenLikesDialog = () =>
    requireAuth('view likes', () => {
      if (likeCount > 0) setIsLikesDialogOpen(true);
    });
  const handleCloseLikesDialog = () => setIsLikesDialogOpen(false);

  const handleFocusCommentInput = () => {
    postCommentsRef.current?.focusCommentInput();
  };

  const location = useLocation();

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const fullUrl = `${window.location.origin}${location.pathname}${location.search}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      showSnackbar('Copied post link', 'success');
    } catch (err) {
      console.error('Failed to copy link:', err);
      showSnackbar('Cannot copy post link!', 'error');
    }
  };

  if (!postData) return null;

  const existingCollectionNames = simpleCollections.map((c) => c.name);
  const disableCreate = isLoadingCollections || !!collectionError;
  const createTooltip = isLoadingCollections
    ? 'Loading collection list...'
    : collectionError
      ? `Cannot create: ${collectionError}`
      : '';

  return (
    <>
      <div className="dark:bg-mountain-950 overflow-none rounded-2xl bg-white">
        <CardContent className="flex flex-col gap-2 p-0">
          {/* Title, description, date */}
          <div className="flex flex-col gap-2">
            <div className="text-xl font-bold">{postData.title}</div>
            <AnyShowMoreText
              lines={3}
              more="Show more"
              less="Show less"
              anchorClass="text-blue-600 hover:underline cursor-pointer text-sm"
            >
              {postData.description || ''}
            </AnyShowMoreText>
            <div className="text-xs text-gray-500 italic">
              Posted{' '}
              {postData.created_at &&
              !isNaN(new Date(postData.created_at).getTime()) ? (
                <ReactTimeAgo
                  date={new Date(postData.created_at)}
                  locale="en-US"
                />
              ) : (
                'Unknown time'
              )}
            </div>
          </div>
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {postData.categories?.map((cat) => (
              <div
                key={cat.id}
                className="bg-mountain-50 dark:bg-mountain-800 rounded px-2 py-1 text-xs"
              >
                {cat.name}
              </div>
            ))}
          </div>
          <Divider className="border-0.5" />
          {/* Stats */}
          <div className="text-mountain-950 flex gap-6">
            <div
              className={`text-mountain-950 dark:text-mountain-100 flex items-center gap-1 text-sm ${likeCount > 0 ? 'cursor-pointer hover:underline' : 'cursor-default'}`}
              onClick={handleOpenLikesDialog}
              title={likeCount > 0 ? 'View who liked this' : 'No likes yet'}
            >
              <p className="font-semibold">{likeCount}</p>
              <span className="text-mountain-600 dark:text-mountain-200">
                {likeCount > 1 ? ' Likes' : ' Like'}
              </span>
            </div>
            <div className="text-mountain-950 dark:text-mountain-100 flex items-center gap-1 text-sm">
              <p className="font-semibold">{postData.comment_count}</p>
              <span className="text-mountain-600 dark:text-mountain-200">
                {postData.comment_count > 1 ? ' Comments' : ' Comment'}
              </span>
            </div>
          </div>
          <Divider className="border-0.5" />
          {/* Actions */}
          <div className="flex w-full justify-between">
            <Button
              className="h-10 w-10 min-w-0 rounded-lg border-0 p-2 text-blue-900 hover:bg-blue-50 dark:text-blue-200 hover:dark:bg-blue-900"
              title={userLike ? 'Unlike' : 'Like'}
              onClick={handleLikeClick}
              disabled={isLiking || isFetchingLike}
            >
              {userLike ? (
                <AiFillLike className="size-6 text-blue-900 dark:text-blue-200" />
              ) : (
                <AiOutlineLike className="size-6" />
              )}
            </Button>
            <Button
              className="h-10 w-10 min-w-0 rounded-lg border-0 p-2 text-blue-900 hover:bg-blue-50 dark:text-blue-200 hover:dark:bg-blue-900"
              title="Comment"
              onClick={handleFocusCommentInput}
            >
              <MessageSquareText className="size-5" />
            </Button>
            <Button
              className="h-10 w-10 min-w-0 rounded-lg border-0 p-2 text-blue-900 hover:bg-blue-50 dark:text-blue-200 hover:dark:bg-blue-900"
              title="Save"
              onClick={handleOpenSaveDialog}
            >
              <Bookmark className="size-5" />
            </Button>
            <Button
              className="h-10 w-10 min-w-0 rounded-lg border-0 p-2 text-blue-900 hover:bg-blue-50 dark:text-blue-200 hover:dark:bg-blue-900"
              title="Copy Link"
              onClick={(e) => handleCopyLink(e)}
            >
              <Share2 className="size-5" />
            </Button>
          </div>
        </CardContent>
      </div>
      {/* SavePostDialog */}
      <SavePostDialog
        postId={postData.id}
        open={isSaveDialogOpen}
        onClose={handleCloseSaveDialog}
        onNavigateToCreate={handleNavigateToCreate}
        createDisabled={disableCreate}
        createDisabledReason={createTooltip}
      />
      {/* CreateCollectionDialog */}
      <CreateCollectionDialog
        open={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onSuccess={handleCollectionCreated}
        existingCollectionNames={existingCollectionNames}
      />
      {/* Likes Dialog */}
      <LikesDialog
        contentId={postData.id}
        open={isLikesDialogOpen}
        onClose={handleCloseLikesDialog}
        variant={TargetType.POST}
      />
    </>
  );
};

export default PostInfo;
