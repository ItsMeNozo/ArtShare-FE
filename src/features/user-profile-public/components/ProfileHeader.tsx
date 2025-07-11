import Avatar from 'boring-avatars';
import type { FC } from 'react';

interface ProfileHeaderProps {
  name: string;
  username: string;
  avatarUrl?: string; // make it optional
  isFollowing: boolean;
}

const ProfileHeader: FC<ProfileHeaderProps> = ({
  name,
  username,
  avatarUrl,
}) => {
  return (
    <div className="flex items-center">
      <div className="flex h-36 w-36 items-center justify-center rounded-full bg-white/30 p-1 shadow-md backdrop-blur-md">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${name}'s profile picture`}
            className="h-full w-full object-cover"
          />
        ) : (
          <Avatar
            name={username || 'Unknown'}
            colors={['#84bfc3', '#fff5d6', '#ffb870', '#d96153', '#000511']}
            variant="beam"
            size={128} // matches w-40 (160px)
          />
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
