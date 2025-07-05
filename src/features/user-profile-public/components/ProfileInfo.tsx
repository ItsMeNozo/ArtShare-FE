import type { FC } from "react";
import ProfileStats from "./ProfileStats";

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
    <div className="flex flex-col justify-end pb-4 h-full">
      <h1 className="font-bold text-mountain-950 dark:text-white text-xl">{name} <span className="font-normal text-mountain-400 text-sm">@{username}</span></h1>
      <p className="text-mountain-800 dark:text-white text-sm">{bio}</p>
      <ProfileStats
        following={followings_count || 0}
        followers={followers_count || 0}
        userId={userId}
      />
    </div>
  );
};

export default ProfileInfo;
