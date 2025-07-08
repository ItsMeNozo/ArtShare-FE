// Core
import { useState } from 'react';

// Components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

//Icons
import { Typography } from '@mui/material';
import { AiOutlineInfo } from 'react-icons/ai';

interface InfoMediaRemainingProps {
  currentImageCount: number;
  maxImage: number;
  hasVideo: boolean;
  maxVideo: number;
  hasAI: boolean;
}

const InfoMediaRemaining: React.FC<InfoMediaRemainingProps> = ({
  currentImageCount,
  maxImage,
  hasVideo,
  maxVideo,
  hasAI,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md hover:cursor-pointer"
        >
          <AiOutlineInfo className="size-5" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        className="dark:bg-mountain-900 border-mountain-100 dark:border-mountain-700 w-fit p-0"
      >
        <div className="flex px-2 py-1">
          <span className="mr-2 font-medium">Up to: </span>
          <Typography className="dark:text-mountain-200 text-base text-gray-900">
            {currentImageCount}/{maxImage} images
          </Typography>

          {hasAI && (
            <Typography className="dark:text-mountain-200 text-base text-gray-900">
              , {hasVideo ? 1 : 0}/{maxVideo} video
            </Typography>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default InfoMediaRemaining;
