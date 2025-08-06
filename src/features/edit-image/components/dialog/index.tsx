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
import { RiImageCircleAiLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import BrowsePromptHistory from './BrowsePromptHistory';

const SelectAiImagesPanel: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="text"
          component="label"
          size="small"
          className="flex justify-center items-center bg-white shadow-md p-4 border-1 border-mountain-200 rounded-full w-full h-16 cursor-pointer"
          sx={{
            backgroundColor: 'transparent',
            color: 'white',
            borderRadius: '10px',
            textTransform: 'none',
            '&:hover': { backgroundColor: 'transparent' },
          }}
        >
          <RiImageCircleAiLine className="mr-2 size-6 text-mountain-950" />
          <Typography variant="body1" className="text-mountain-950 text-sm">
            Browse In-App Images
          </Typography>
        </Button>
      </DialogTrigger>
      <DialogContent
        hideCloseButton
        className="z-50 flex flex-col gap-0 p-0 border-mountain-200 min-w-[90%] h-[95%]"
      >
        <DialogTitle hidden />
        <DialogDescription hidden />

        <div className="flex justify-between items-center shadow-md p-4 w-full h-24">
          <div className="flex flex-col">
            <p className="flex font-medium text-lg">
              Edit With Your AI Images
            </p>
            <p className="flex text-mountain-600 text-sm">
              Browse your AI images and start to edit
            </p>
          </div>
          <Link
            to="/image/tool/text-to-image"
            className="flex items-center bg-gradient-to-r from-blue-100 to-purple-100 shadow hover:brightness-105 px-4 py-2 rounded-full hover:scale-105 duration-300 ease-in-out hover:cursor-pointer transform"
          >
            <IoSparkles className="mr-2 text-amber-300" />
            <p>Generated with ArtNova</p>
          </Link>
        </div>
        <BrowsePromptHistory />
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default SelectAiImagesPanel;
