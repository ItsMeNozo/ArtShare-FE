export interface LikingUser {
  id: string;
  username: string;
  fullName: string | null;
  profilePictureUrl: string | null;
  isFollowing?: boolean;
}

export interface LikeApiResponseItem {
  user: LikingUser;

  createdAt?: string;
}
