import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import React from 'react';
import { IoSparkles } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import BrowseGenHistory from './BrowseGenHistory';

interface SelectAiImagesPanelProps {
  children: React.ReactNode;
}

const SelectAiImagesPanel: React.FC<SelectAiImagesPanelProps> = ({
  children,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        hideCloseButton
        className="z-50 flex flex-col gap-0 p-0 border-mountain-200 min-w-[90%] h-[95%]"
      >
        <DialogTitle hidden />
        <DialogDescription hidden />
        <div className="flex justify-between items-center shadow-md p-4 w-full h-24">
          <div className="flex flex-col">
            <p className="flex font-medium text-lg">Post With Your AI Images</p>
            <p className="flex text-mountain-600 text-sm">
              Browse your ai images and start sharing over the world
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
        <BrowseGenHistory />
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default SelectAiImagesPanel;
