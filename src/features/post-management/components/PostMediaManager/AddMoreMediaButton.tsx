import { Box, Button, Stack } from '@mui/material';
import { memo } from 'react';
import { MdAdd, MdImage, MdVideocam } from 'react-icons/md';

interface AddMoreMediaButtonProps {
  hidden: boolean;
  handleImagesAdded: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleVideoAdded: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddMoreMediaButton = ({
  hidden,
  handleImagesAdded,
  handleVideoAdded,
}: AddMoreMediaButtonProps) => {
  return (
    <Box
      sx={{
        // This is the positioning and hover context
        position: 'relative',
        display: hidden ? 'none' : 'inline-block',

        // This selector remains the same and works perfectly
        '&:hover .options-container': {
          opacity: 1,
          visibility: 'visible',
          transform: 'translate(-50%, 0)',
          pointerEvents: 'auto',
        },
      }}
    >
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
        >
          Image
          <input
            accept="image/*"
            type="file"
            multiple
            hidden
            onChange={handleImagesAdded}
          />
        </Button>
        <Button
          component="label"
          variant="contained"
          startIcon={<MdVideocam />}
          size="small"
        >
          Video
          <input
            type="file"
            accept="video/*"
            hidden
            onChange={handleVideoAdded}
          />
        </Button>
      </Stack>

      {/* The always-visible '+' button */}
      <Box className="border-mountain-600 flex h-[80px] w-[80px] cursor-pointer items-center justify-center rounded-md border text-gray-900 dark:text-white">
        <MdAdd size={32} />
      </Box>
    </Box>
  );
};

export default memo(AddMoreMediaButton);
