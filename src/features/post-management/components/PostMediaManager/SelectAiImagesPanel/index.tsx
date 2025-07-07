import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button, Typography } from '@mui/material';
import React from 'react';
import { IoSparkles } from 'react-icons/io5';
import { RiImageCircleAiFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { MediaPreviewContainer } from '../MediaPreviewContainer';
import BrowsePromptHistory from './BrowsePromptHistory';

const SelectAiImagesPanel: React.FC = () => {
  return (
    <MediaPreviewContainer>
      <Dialog>
        <DialogTrigger>
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
            <RiImageCircleAiFill className="text-mountain-600 mb-2 size-10" />
            <Typography variant="body1" className="text-sm">
              Browse My Stock
            </Typography>
          </Button>
        </DialogTrigger>
        <DialogContent
          hideCloseButton
          className="flex h-[95%] min-w-[90%] flex-col gap-0 p-0"
        >
          <DialogTitle hidden />
          <DialogDescription hidden />

          <div className="flex h-24 w-full items-center justify-between p-4 shadow-md">
            <div className="flex flex-col">
              <p className="flex text-lg font-medium">
                Post With Your AI Images
              </p>
              <p className="text-mountain-600 flex text-sm">
                Browse your ai images and start sharing over the world
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

          <BrowsePromptHistory />
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog>
    </MediaPreviewContainer>
  );
};
export default SelectAiImagesPanel;
