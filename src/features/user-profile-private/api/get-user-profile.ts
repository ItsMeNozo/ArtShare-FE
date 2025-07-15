import api from '@/api/baseApi';
import { User } from '@/types';
import { AxiosError } from 'axios';

/**
 * GET /users/profile
 *
 * Fetches the currently logged-in user's profile data
 *
 * @returns A promise resolving to the User object
 */
export const getUserProfile = async (): Promise<User> => {
  console.log('🔍 getUserProfile called (current user)');

  try {
    const response = await api.get<User>('/users/profile');
    console.log('✅ getUserProfile successful');
    return response.data;
  } catch (error) {
    console.error('❌ getUserProfile error:', error);

    // If it's a 401, it means the user is not authenticated yet
    if (error instanceof AxiosError && error.response?.status === 401) {
      throw new Error('User not authenticated yet');
    }

    throw error;
  }
};
