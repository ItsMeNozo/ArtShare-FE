import type { FC } from 'react';
import ProfileStats from './ProfileStats';

interface ProfileInfoProps {
  name: string;
  username: string;
  bio: string;
  followings_count: number;
  followers_count: number;
  userId: string;
}

const ProfileInfo: FC<ProfileInfoProps> = ({
  name,
  username,
  bio,
  followings_count,
  followers_count,
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
        following={followings_count || 0}
        followers={followers_count || 0}
        userId={userId}
      />
    </div>
  );
};

export default ProfileInfo;
