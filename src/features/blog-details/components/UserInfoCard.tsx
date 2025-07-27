import { Button } from '@mui/material';
import Avatar from 'boring-avatars';
import { memo } from 'react';
import { IoPersonAddOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  fullName: string;
  profilePictureUrl?: string;
  followersCount: number;
  isFollowing?: boolean;
}

interface UserInfoCardProps {
  user: User;
  isOwnProfile?: boolean;
  isFollowLoading?: boolean;
  onToggleFollow?: () => void;
  className?: string;
}

const UserInfoCard = memo(
  ({
    user,
    isOwnProfile = false,
    isFollowLoading = false,
    onToggleFollow,
    className = '',
  }: UserInfoCardProps) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
      navigate(`/${user.username}`);
    };

    const handleFollowClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleFollow?.();
    };

    return (
      <div
        className={`dark:border-mountain-700 flex cursor-pointer items-center justify-between rounded-lg border border-transparent bg-gradient-to-r from-indigo-100 to-purple-100 p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:from-indigo-900/30 dark:to-purple-900/30 ${className}`}
        onClick={handleCardClick}
      >
        <div className="flex items-center space-x-4">
          {user.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={user.username}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <Avatar
              name={user.username}
              size={48}
              variant="beam"
              colors={['#84bfc3', '#ff9b62', '#d96153']}
            />
          )}
          <div className="flex flex-col">
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {user.fullName}
            </p>
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <span>@{user.username}</span>
              <span className="text-gray-400 dark:text-gray-500">•</span>
              <span>
                {user.followersCount.toLocaleString()}{' '}
                {user.followersCount <= 1 ? 'follower' : 'followers'}
              </span>
            </div>
          </div>
        </div>

        {!isOwnProfile && onToggleFollow && (
          <Button
            onClick={handleFollowClick}
            disabled={isFollowLoading}
            className="dark:bg-mountain-800 hover:bg-mountain-50 dark:hover:bg-mountain-700 border-mountain-200 dark:border-mountain-600 flex h-10 w-32 items-center border bg-white text-sm font-medium text-black shadow dark:text-white"
          >
            <IoPersonAddOutline className="mr-2 text-blue-500 dark:text-blue-400" />
            {user.isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </div>
    );
  },
);

UserInfoCard.displayName = 'UserInfoCard';

export default UserInfoCard;
