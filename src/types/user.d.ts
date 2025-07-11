export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  isOnboard: boolean;
  followersCount: number;
  followingsCount: number;
  profilePictureUrl?: string | null;
  bio?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
  refreshToken?: string | null;
  collections?: Collection[];
  blogs?: Blog[];
  bookmarks?: Bookmark[];
  comments?: Comment[];
  followers?: Follow[];
  followings?: Follow[];
  likes?: Like[];
  posts?: Post[];
  ratings?: Rating[];
  shares?: Share[];
  roles?: UserRole[];
}
