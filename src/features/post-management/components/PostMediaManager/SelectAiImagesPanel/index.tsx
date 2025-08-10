import { Button, Dialog, DialogContent, Typography } from '@mui/material';
import React, { useState } from 'react';
import { IoSparkles } from 'react-icons/io5';
import { RiImageCircleAiFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { MediaPreviewContainer } from '../MediaPreviewContainer';
import BrowsePromptHistory from './BrowsePromptHistory';

const SelectAiImagesPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <MediaPreviewContainer>
      {/* This is the trigger button */}
      <Button
        variant="text"
        size="small"
        onClick={handleOpen}
        className="hover:bg-mountain-50 border-mountain-200 flex w-40 flex-col items-center justify-center border-1 bg-white p-4 shadow-md"
        sx={{
          backgroundColor: 'transparent',
          color: 'white',
          borderRadius: '10px',
          textTransform: 'none',
          '&:hover': { backgroundColor: 'transparent' },
        }}
      >
        <RiImageCircleAiFill className="text-mountain-600 mb-2 size-10" />
        <Typography variant="body1" className="text-sm">
          Browse My Stock
        </Typography>
      </Button>

      {/* This is the MUI Dialog */}
      <Dialog
        open={isOpen}
        onClose={handleClose}
        fullWidth={true}
        maxWidth="xl" // Or 'lg', 'md', etc.
        slotProps={{
          paper: {
            sx: {
              height: '95%',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <DialogContent
          sx={{ padding: 0, display: 'flex', flexDirection: 'column' }}
        >
          <div className="flex h-24 w-full items-center justify-between p-4 shadow-md">
            <div className="flex flex-col">
              <p className="flex text-lg font-medium">
                Post With Your AI Images
              </p>
              <p className="text-mountain-600 flex text-sm">
                Browse your AI images and start sharing over the world
              </p>
            </div>
            <Link
              to="/image/tool/text-to-image"
              className="flex transform items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 shadow duration-300 ease-in-out hover:scale-105 hover:cursor-pointer hover:brightness-105"
            >
              <IoSparkles className="mr-2 text-amber-300" />
              <p>Generated with ArtNova</p>
            </Link>
          </div>

          {/* Your content remains the same */}
          <BrowsePromptHistory />
        </DialogContent>
      </Dialog>
    </MediaPreviewContainer>
  );
};

export default SelectAiImagesPanel;
