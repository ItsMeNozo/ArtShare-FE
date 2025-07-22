import { PaginatedResponse } from '@/api/types/paginated-response.type';
import { PublicUserSearchDto, UserPhoto } from '../types';

interface TransformedUserPage {
  photos: UserPhoto[];
  hasNextPage: boolean;
  page: number;
}

export const usersToPhotos = async (
  usersResponse: PaginatedResponse<PublicUserSearchDto>,
): Promise<TransformedUserPage> => {
  const photoPromises = (usersResponse.data ?? []).map(transformUserToPhoto);
  const resolvedPhotos = await Promise.all(photoPromises);
  const validPhotos = resolvedPhotos.filter((photo) => photo !== null);
  return {
    photos: validPhotos,
    hasNextPage: usersResponse.hasNextPage,
    page: usersResponse.page,
  };
};

const transformUserToPhoto = (
  user: PublicUserSearchDto,
): Promise<UserPhoto | null> => {
  return new Promise((resolve) => {
    const profilePictureUrl =
      user.profilePictureUrl ||
      'https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2247726673.jpg';
    const image = new Image();
    image.src = profilePictureUrl;

    image.onload = () => {
      resolve({
        // Properties required by react-photo-album
        key: user.username,
        src: profilePictureUrl,
        width: image.naturalWidth,
        height: image.naturalHeight,

        username: user.username,
        fullName: user.fullName,
        profilePictureUrl: user.profilePictureUrl,
      });
    };

    image.onerror = () => {
      console.error(`Failed to load image for user: ${user.username}`);
      resolve(null);
    };
  });
};
