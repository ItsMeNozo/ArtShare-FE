import { PublicUserSearchDto, UserPhoto } from '../types';

export const transformUserToPhoto = (
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
