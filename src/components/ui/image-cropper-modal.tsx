import { Button } from '@/components/ui/button';
import { ThumbnailMeta } from '@/features/post-management/types/crop-meta.type';
import getCroppedImg from '@/utils/cropImage';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import MuiButton from '@mui/material/Button';
import React, { memo, useEffect, useState } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { MdClose } from 'react-icons/md';

interface Props {
  originalThumbnailUrl: string;
  open: boolean;
  onClose: () => void;
  onCropped: (croppedFile: Blob, thumbnailCropMeta: ThumbnailMeta) => void;
  thumbnailMeta: ThumbnailMeta;
}

const ImageCropperModal: React.FC<Props> = ({
  originalThumbnailUrl,
  open,
  onClose,
  onCropped,
  thumbnailMeta,
}) => {
  const [crop, setCrop] = useState<Point>(DEFAULT_CROP);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [selectedAspect, setSelectedAspect] = useState(DEFAULT_ASPECT_LABEL);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  console.log('ImageCropperModal rendered with thumbnailMeta:', thumbnailMeta);
  console.log('originalThumbnailUrl:', originalThumbnailUrl);

  useEffect(() => {
    if (!open) return;
    console.log('ImageCropperModal opened with thumbnailMeta:', thumbnailMeta);
    setCrop(thumbnailMeta.crop ?? DEFAULT_CROP);
    setZoom(thumbnailMeta.zoom ?? DEFAULT_ZOOM);
    setSelectedAspect(thumbnailMeta.selectedAspect ?? DEFAULT_ASPECT_LABEL);
    if (!thumbnailMeta.aspect) {
      // we don't need to store the natural aspect so we handle it here ayo
      const img = new Image();
      img.src = originalThumbnailUrl;
      img.onload = () => {
        const naturalAspect = img.width / img.height;
        setAspect(naturalAspect);
      };
    } else {
      setAspect(thumbnailMeta.aspect);
    }
  }, [open, originalThumbnailUrl, thumbnailMeta]);

  const cropImageAndSave = async () => {
    if (croppedAreaPixels) {
      const cropped = await getCroppedImg(
        originalThumbnailUrl,
        croppedAreaPixels,
      );
      const thumbnailCropMeta = {
        crop,
        zoom,
        aspect,
        croppedAreaPixels,
        selectedAspect,
      };
      onCropped(cropped, thumbnailCropMeta);
      onClose();
    }
  };

  const handleAspectChange = (option: AspectOption) => {
    setAspect(option.value);
    setSelectedAspect(option.label);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          width: '50vw',
          maxWidth: '50vw',
          margin: 'auto',
        },
      }}
    >
      <DialogTitle className="flex items-center justify-between">
        <Typography variant="h6">Crop Image</Typography>
        <IconButton onClick={onClose} size="small">
          <MdClose size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        className="flex flex-col gap-4"
        sx={{
          padding: 0,
          maxHeight: 'calc(100vh - 150px)',
          overflow: 'auto',
        }}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{ height: 320, minHeight: 280 }}
        >
          <Cropper
            image={originalThumbnailUrl}
            initialCroppedAreaPixels={
              thumbnailMeta.croppedAreaPixels ?? undefined
            }
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_: Area, croppedPixels: Area) =>
              setCroppedAreaPixels(croppedPixels)
            }
          />
        </div>

        <div className="flex flex-col gap-3 px-6 pb-4 text-sm dark:text-white">
          <div>
            <label className="mb-1 block font-medium">
              {' '}
              {/* Added block and margin for better label spacing */}
              Zoom: {zoom.toFixed(1)}x{' '}
              {/* Display current zoom next to label */}
            </label>
            <input
              type="range"
              min="1" // Min zoom value
              max="3" // Max zoom value
              step="0.1"
              value={zoom}
              onChange={(e) => {
                setZoom(Number(e.target.value));
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700" // Added dark mode bg
            />
            {/* Simplified labels for min and max */}
            <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Min (1x)</span>
              <span>Max (3x)</span>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {aspectOptions.map((option) => (
              <Button
                key={option.label}
                variant={
                  selectedAspect === option.label ? 'default' : 'outline'
                }
                onClick={() => handleAspectChange(option)}
                className="cursor-pointer"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>

      <DialogActions>
        <MuiButton
          variant="outlined"
          onClick={onClose}
          className="dark:text-white"
          sx={{
            border: 'none',
            color: '#000', // black text
            fontWeight: 500,
            '&:hover': {
              backgroundColor: '#f3f4f6', // subtle gray background on hover (optional)
              border: 'none',
            },
          }}
        >
          Cancel
        </MuiButton>

        <MuiButton variant="contained" onClick={cropImageAndSave}>
          Crop & Save
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
};

export default memo(ImageCropperModal, (prevProps, nextProps) => {
  return (
    prevProps.open === nextProps.open &&
    prevProps.originalThumbnailUrl === nextProps.originalThumbnailUrl
  );
});

interface AspectOption {
  label: string;
  value: number;
}

const aspectOptions: AspectOption[] = [
  { label: '1:1', value: 1 },
  { label: '3:2', value: 3 / 2 },
  { label: '2:3', value: 2 / 3 },
  { label: '9:16', value: 9 / 16 },
];

const DEFAULT_CROP = { x: 0, y: 0 };
const DEFAULT_ZOOM = 1;
const DEFAULT_ASPECT_LABEL = 'Original';
