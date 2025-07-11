import { Photo } from 'react-photo-album';

export interface PublicUserSearchDto {
  fullName: string | null;
  username: string;
  profilePictureUrl: string | null;
  followersCount: number;
  followingsCount: number;
}

export interface UserPhoto extends Photo {
  fullName: string | null;
  username: string;
  profilePictureUrl: string | null;
}
