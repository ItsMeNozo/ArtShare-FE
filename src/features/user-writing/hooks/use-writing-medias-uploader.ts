import {
  getPresignedUrl,
  GetPresignedUrlResponse,
  uploadFile,
} from '@/api/storage';
import { useSnackbar } from '@/hooks/useSnackbar';
import { nanoid } from 'nanoid';
const WRITING_STORAGE_DIRECTORY = 'blogs';

export function useWritingMediaUploader() {
  const { showSnackbar } = useSnackbar();

  const handleUploadVideo = async (
    videoFile: File,
  ): Promise<string | undefined> => {
    try {
      const presignedUrlResponse: GetPresignedUrlResponse =
        await getPresignedUrl(
          `${videoFile.name.split('.')[0]}_${nanoid(6)}`,
          videoFile.type.split('/')[1],
          'video',
          WRITING_STORAGE_DIRECTORY,
        );
      await uploadFile(videoFile, presignedUrlResponse.presignedUrl);
      return presignedUrlResponse.fileUrl;
    } catch (error) {
      showSnackbar('Failed to upload video', 'error');
      throw error;
    }
  };

  const handleUploadImageFile = async (
    imageFile: File,
    filenNamePrefix: string,
  ): Promise<string | undefined> => {
    try {
      const presigned: GetPresignedUrlResponse = await getPresignedUrl(
        `${filenNamePrefix}_${nanoid(6)}`,
        imageFile.type.split('/')[1],
        'image',
        WRITING_STORAGE_DIRECTORY,
      );
      await uploadFile(imageFile, presigned.presignedUrl);
      return presigned.fileUrl;
    } catch (error) {
      showSnackbar('Failed to upload image', 'error');
      throw error;
    }
  };

  return {
    handleUploadVideo,
    handleUploadImageFile,
  };
}
