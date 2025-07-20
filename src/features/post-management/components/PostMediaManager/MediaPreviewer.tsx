import { MEDIA_TYPE } from '@/utils/constants';
import { Box } from '@mui/material';
import { PostMedia } from '../../types/post-media';

interface MediaPreviewerProps {
  media: PostMedia;
}

const MediaPreviewer: React.FC<MediaPreviewerProps> = ({ media }) => {
  return media.type === MEDIA_TYPE.IMAGE ? (
    <img
      src={media.url}
      alt="Preview"
      className="max-w-full max-h-full object-contain"
    />
  ) : (
    <Box className="relative w-full" sx={{ maxHeight: 500, minHeight: 300 }}>
      <video
        src={media.url}
        controls
        className="rounded w-full object-contain"
        style={{
          maxHeight: '100%',
          width: '100%',
          objectFit: 'contain',
        }}
      />
    </Box>
  );
};

export default MediaPreviewer;
