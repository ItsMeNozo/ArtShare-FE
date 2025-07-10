// src/components/ProfileStats.tsx
import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import {
  getFollowersListByUserId,
  getFollowingsListByUserId,
} from '../api/follow.api';
import FollowListModal from './FollowListModal';

interface ProfileStatsProps {
  userId: string;
  following: number;
  followers: number;
}

const ProfileStats: FC<ProfileStatsProps> = ({
  userId,
  following,
  followers,
}) => {
  const [openModal, setOpenModal] = useState<null | 'followings' | 'followers'>(
    null,
  );

  const {
    data: followingsList,
    isFetching: isFetchingFollowings,
    refetch: refetchFollowings,
  } = useQuery({
    queryKey: ['followingsList', userId],
    queryFn: async () => (await getFollowingsListByUserId(userId)).data,
    enabled: false,
  });

  const {
    data: followersList,
    isFetching: isFetchingFollowers,
    refetch: refetchFollowers,
  } = useQuery({
    queryKey: ['followersList', userId],
    queryFn: async () => (await getFollowersListByUserId(userId)).data,
    enabled: false,
  });

  const openFollowingsModal = async () => {
    setOpenModal('followings');
    try {
      await refetchFollowings();
    } catch (err) {
      console.error('Failed to load followings:', err);
    }
  };

  const openFollowersModal = async () => {
    setOpenModal('followers');
    try {
      await refetchFollowers();
    } catch (err) {
      console.error('Failed to load followers:', err);
    }
  };

  const closeModal = () => setOpenModal(null);

  return (
    <>
      <div className="flex items-center gap-2 text-sm">
        <div
          onClick={openFollowingsModal}
          className="group flex cursor-pointer items-center rounded-md py-1 transition-colors duration-200"
        >
          <span className="text-mountain-600 font-bold dark:text-white">
            {following}
          </span>
          <span className="text-mountain-600 ml-1 group-hover:underline dark:text-gray-500">
            Following
          </span>
        </div>
        <span>•</span>
        <div
          onClick={openFollowersModal}
          className="group flex cursor-pointer items-center rounded-md py-1 transition-colors duration-200"
        >
          <span className="text-mountain-600 font-bold dark:text-white">
            {followers}
          </span>
          <span className="text-mountain-600 ml-1 group-hover:underline dark:text-gray-500">
            Followers
          </span>
        </div>
      </div>

      <FollowListModal
        open={openModal === 'followings'}
        title="Following"
        loading={isFetchingFollowings}
        data={followingsList || []}
        onClose={closeModal}
      />

      <FollowListModal
        open={openModal === 'followers'}
        title="Followers"
        loading={isFetchingFollowers}
        data={followersList || []}
        onClose={closeModal}
      />
    </>
  );
};

export default ProfileStats;
