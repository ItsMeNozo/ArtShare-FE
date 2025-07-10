import api from '@/api/baseApi';

export interface UserProfile {
  id: string;
  username?: string;
  email?: string;
  fullName?: string;
  profilePictureUrl: string | null;
  bio?: string | null;
  followingsCount: number;
  followersCount: number;
  isFollowing: boolean;
  birthday: string | null;
}

export const getUserProfile = async (userId?: string): Promise<UserProfile> => {
  const url = userId
    ? `/users/profile/${encodeURIComponent(userId)}`
    : '/users/profile';

  console.log('url for userProfile: ', url);

  try {
    const { data } = await api.get<UserProfile>(url);
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const getUserProfileByUsername = async (
  username?: string,
): Promise<UserProfile> => {
  console.log('🔍 getUserProfileByUsername called with username: ', username);

  const url = `/users/profile/username/${username}`;

  try {
    const { data } = await api.get<UserProfile>(url);
    console.log('✅ getUserProfileByUsername successful for: ', username);
    return data;
  } catch (error) {
    console.error(
      '❌ Error fetching user profile by username:',
      username,
      error,
    );
    throw error;
  }
};
