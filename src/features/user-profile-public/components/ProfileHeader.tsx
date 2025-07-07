import type { FC } from "react";
import Avatar from "boring-avatars";

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
      <div className="flex justify-center items-center bg-white/30 shadow-md backdrop-blur-md p-1 rounded-full w-36 h-36">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${name}'s profile picture`}
            className="w-full h-full object-cover"
          />
        ) : (
          <Avatar
            name={username || "Unknown"}
            colors={["#84bfc3", "#fff5d6", "#ffb870", "#d96153", "#000511"]}
            variant="beam"
            size={128} // matches w-40 (160px)
          />
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
