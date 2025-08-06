import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@mui/material';
import React from 'react';
import { IoSparkles } from 'react-icons/io5';
import { RiImageCircleAiFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import BrowseGenHistory from './BrowseGenHistory';

const SelectAiImagesPanel: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="text"
          component="label"
          className="border-mountain-200 text-mountain-950 mx-2 flex w-48 cursor-pointer flex-col items-center rounded-md border px-4 py-2 text-center text-sm font-medium shadow-sm"
        >
          <RiImageCircleAiFill className="mb-2 size-6" />
          <p>Browse Your Stock</p>
        </Button>
      </DialogTrigger>
      <DialogContent
        hideCloseButton
        className="border-mountain-200 z-50 flex h-[95%] min-w-[90%] flex-col gap-0 p-0"
      >
        <DialogTitle hidden />
        <DialogDescription hidden />
        <div className="flex h-24 w-full items-center justify-between p-4 shadow-md">
          <div className="flex flex-col">
            <p className="flex text-lg font-medium">Post With Your AI Images</p>
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
        <BrowseGenHistory />
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default SelectAiImagesPanel;
