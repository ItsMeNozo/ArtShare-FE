import { Box, Button, Stack } from '@mui/material';
import { Upload } from 'lucide-react';
import { memo } from 'react';
import { MdImage } from 'react-icons/md';
import { RiImageCircleAiFill } from 'react-icons/ri';
import SelectAiImagesPanel from './SelectGenImages';

interface AddMoreImagesButtonProps {
  disabled: boolean;
  onFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddMoreImagesButton = ({
  disabled,
  onFileChange,
}: AddMoreImagesButtonProps) => {
  return (
    <Box
      className={`${disabled ? 'pointer-events-none opacity-50' : ''} hover:bg-mountain-50 border-mountain-200 text-mountain-950 flex w-2/3 cursor-pointer items-center justify-center gap-2 rounded-md border bg-white px-4 py-2 text-center text-sm font-medium shadow-sm`}
      sx={{
        // This is the positioning and hover context
        position: 'relative',
        // display: disabled ? 'none' : 'inline-block',

        // This selector remains the same and works perfectly
        '&:hover .options-container': {
          opacity: 1,
          visibility: 'visible',
          transform: 'translate(-50%, 0)',
          pointerEvents: 'auto',
        },
      }}
    >
      <Upload />
      <span>Add More</span>
      <Stack
        className="options-container"
        direction="column"
        spacing={1}
        sx={{
          position: 'absolute',
          // Position it 12px above the parent's top edge
          bottom: 'calc(100% - 12px)',
          left: '50%',

          // Add invisible padding to the bottom to bridge the hover gap.
          // This makes the element's hover area 12px taller downwards.
          paddingBottom: '24px',

          // --- Initial State (hidden) ---
          opacity: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
          transform: 'translate(-50%, 10px)',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <Button
          component="label"
          variant="contained"
          startIcon={<MdImage />}
          size="small"
          className="bg-blue-400 text-white"
        >
          <span>From device</span>
          <input
            type="file"
            style={{ display: 'none' }}
            accept="image/*"
            multiple
            onChange={onFileChange}
          />
        </Button>
        <SelectAiImagesPanel>
          <Button
            component="label"
            variant="contained"
            startIcon={<RiImageCircleAiFill />}
            size="small"
            className="bg-blue-400 text-white"
          >
            Your AI images
          </Button>
        </SelectAiImagesPanel>
      </Stack>

      {/* The always-visible '+' button */}
      {/* <Box className="border-mountain-600 flex h-[80px] w-[80px] cursor-pointer items-center justify-center rounded-md border text-gray-900 dark:text-white">
        <MdAdd size={32} />
      </Box> */}
    </Box>
  );
};

export default memo(AddMoreImagesButton);
