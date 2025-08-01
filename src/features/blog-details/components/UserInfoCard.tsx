import { Button, CircularProgress } from '@mui/material';
import Avatar from 'boring-avatars';
import { memo } from 'react';
import { IoPersonAddOutline, IoPersonRemoveOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

import type { BlogUser } from '@/types/blog';

type UserInfoCardProps = {
  user: BlogUser & { followersCount: number; isFollowing?: boolean };
  isOwnProfile?: boolean;
  isFollowLoading?: boolean;
  onToggleFollow?: () => void;
  className?: string;
};

const UserInfoCard = memo(
  ({
    user,
    isOwnProfile = false,
    isFollowLoading = false,
    onToggleFollow,
    className = '',
  }: UserInfoCardProps) => {
    const navigate = useNavigate();

    const handleCardClick = () => navigate(`/u/${user.username}`);

    const handleFollowClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user.id?.trim()) {
        console.error('Invalid user ID for follow action:', user.id);
        return;
      }
      onToggleFollow?.();
    };

    const getButtonContent = () => {
      if (!user.id?.trim()) {
        return <span className="text-xs">Invalid ID</span>;
      }

      if (isFollowLoading) {
        return (
          <>
            <CircularProgress
              size={16}
              className="mr-2 text-blue-500 dark:text-blue-400"
            />
            <span>{user.isFollowing ? 'Unfollowing...' : 'Following...'}</span>
          </>
        );
      }

      return (
        <>
          {user.isFollowing ? (
            <IoPersonRemoveOutline className="mr-2 text-red-500 dark:text-red-400" />
          ) : (
            <IoPersonAddOutline className="mr-2 text-blue-500 dark:text-blue-400" />
          )}
          <span>{user.isFollowing ? 'Unfollow' : 'Follow'}</span>
        </>
      );
    };

    const getButtonStyles = () => {
      const baseStyles =
        'flex h-10 w-32 items-center justify-center border text-sm font-medium shadow transition-all duration-200';

      if (isFollowLoading || !user.id?.trim()) {
        return `${baseStyles} cursor-not-allowed opacity-70 bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400`;
      }

      if (user.isFollowing) {
        return `${baseStyles} bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/40`;
      }

      return `${baseStyles} bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40`;
    };

    return (
      <div
        className={`dark:border-mountain-700 flex cursor-pointer items-center justify-between rounded-lg border border-transparent bg-gradient-to-r from-indigo-100 to-purple-100 p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:from-indigo-900/30 dark:to-purple-900/30 ${className}`}
        onClick={handleCardClick}
      >
        <div className="flex items-center space-x-4">
          {user.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={user.username}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
            />
          ) : (
            <div className="rounded-full ring-2 ring-white dark:ring-gray-700">
              <Avatar
                name={user.username}
                size={48}
                variant="beam"
                colors={['#84bfc3', '#ff9b62', '#d96153']}
              />
            </div>
          )}
          <div className="flex flex-col">
            <p className="max-w-48 truncate text-lg font-medium text-gray-900 dark:text-gray-100">
              {user.fullName}
            </p>
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="max-w-32 truncate">@{user.username}</span>
              <span className="text-gray-400 dark:text-gray-500">•</span>
              <span className="whitespace-nowrap">
                {user.followersCount.toLocaleString()}{' '}
                {user.followersCount === 1 ? 'follower' : 'followers'}
              </span>
            </div>
          </div>
        </div>

        {!isOwnProfile && onToggleFollow && (
          <Button
            onClick={handleFollowClick}
            disabled={isFollowLoading || !user.id?.trim()}
            className={getButtonStyles()}
            aria-label={
              user.isFollowing
                ? `Unfollow ${user.username}`
                : `Follow ${user.username}`
            }
          >
            {getButtonContent()}
          </Button>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.user.isFollowing === nextProps.user.isFollowing &&
      prevProps.user.followersCount === nextProps.user.followersCount &&
      prevProps.isFollowLoading === nextProps.isFollowLoading &&
      prevProps.isOwnProfile === nextProps.isOwnProfile
    );
  },
);

UserInfoCard.displayName = 'UserInfoCard';

export default UserInfoCard;
