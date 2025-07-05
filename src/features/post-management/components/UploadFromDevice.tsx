import { Button, Typography } from '@mui/material';
import { ChangeEvent } from 'react';
import { BsImageFill } from 'react-icons/bs';
import { RiFileVideoFill } from 'react-icons/ri';
import { MediaPreviewContainer } from './media-preview-container';

interface UploadFromDeviceProps {
  onAddImages: (event: ChangeEvent<HTMLInputElement>) => void;
  onAddVideo: (event: ChangeEvent<HTMLInputElement>) => void;
}

const UploadFromDevice: React.FC<UploadFromDeviceProps> = ({
  onAddImages,
  onAddVideo,
}) => {
  return (
    <MediaPreviewContainer
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
          onAddImages({
            target: { files: droppedFiles },
          } as ChangeEvent<HTMLInputElement>);
        }
      }}
    >
      <div className="flex space-x-2">
        <Button
          variant="text"
          component="label"
          size="small"
          className="hover:bg-mountain-50 border-mountain-200 flex w-40 flex-col items-center justify-center border-1 bg-white p-4 shadow-md"
          sx={{
            backgroundColor: 'transparent',
            color: 'white',
            borderRadius: '10px',
            textTransform: 'none',
            '&:hover': { backgroundColor: 'transparent' },
          }}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            hidden
            onChange={onAddImages}
          />
          <BsImageFill className="text-mountain-600 mb-2 size-10" />
          <Typography variant="body1" className="text-sm">
            Upload Image
          </Typography>
        </Button>
        <Button
          variant="text"
          component="label"
          size="small"
          className="hover:bg-mountain-50 border-mountain-200 flex w-40 flex-col items-center justify-center border-1 bg-white p-4 shadow-md"
          sx={{
            backgroundColor: 'transparent',
            color: 'white',
            borderRadius: '10px',
            textTransform: 'none',
            '&:hover': { backgroundColor: 'transparent' },
          }}
        >
          <input type="file" accept="video/*" hidden onChange={onAddVideo} />
          <RiFileVideoFill className="text-mountain-600 mb-2 size-10" />
          <Typography variant="body1" className="text-sm">
            Upload Video
          </Typography>
        </Button>
      </div>
      <Typography variant="body1" className="mt-2">
        or drag and drop here
      </Typography>
    </MediaPreviewContainer>
  );
};

export default UploadFromDevice;
