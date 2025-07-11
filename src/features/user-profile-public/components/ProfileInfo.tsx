import type { FC } from 'react';
import ProfileStats from './ProfileStats';

interface ProfileInfoProps {
  name: string;
  username: string;
  bio: string;
  followingsCount: number;
  followersCount: number;
  userId: string;
}

const ProfileInfo: FC<ProfileInfoProps> = ({
  name,
  username,
  bio,
  followingsCount,
  followersCount,
  userId,
}) => {
  return (
    <div className="flex h-full flex-col justify-end pb-4">
      <h1 className="text-mountain-950 text-xl font-bold dark:text-white">
        {name}{' '}
        <span className="text-mountain-400 text-sm font-normal">
          @{username}
        </span>
      </h1>
      <p className="text-mountain-800 text-sm dark:text-white">{bio}</p>
      <ProfileStats
        following={followingsCount || 0}
        followers={followersCount || 0}
        userId={userId}
      />
    </div>
  );
};

export default ProfileInfo;
