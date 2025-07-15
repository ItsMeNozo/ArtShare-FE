import api from '@/api/baseApi';

export const followUser = (userId: string) =>
  api.post(`/users/${userId}/follow`);

export const unfollowUser = (userId: string) =>
  api.post(`/users/${userId}/unfollow`);

export const getFollowingsListByUserId = (userId: string) =>
  api.get(`/users/${userId}/followings`);

export const getFollowersListByUserId = (userId: string) =>
  api.get(`/users/${userId}/followers`);
