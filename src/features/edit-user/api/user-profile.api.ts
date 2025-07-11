import api from '@/api/baseApi';
import { UserProfile } from '@/features/user-profile-public/api/user-profile.api';

export interface UpdateUserDTO {
  email?: string;
  username?: string;
  fullName?: string;
  profilePictureUrl?: string | null;
  bio?: string | null;
  birthday?: string | null; // ISO date string, e.g. "2003-01-28"
}

export const updateUserProfile = (payload: UpdateUserDTO) =>
  api.patch<UserProfile>('/users/profile', payload);
