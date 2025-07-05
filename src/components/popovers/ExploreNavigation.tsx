// Cores
import { useState } from 'react';

// Icons
import { Image, Video } from 'lucide-react';
import { MdExplore, MdOutlineExplore } from 'react-icons/md';

// Components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Link } from 'react-router-dom';

const ExploreNavigation = () => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={`group flex h-full items-center border-b-4 ${
            location.pathname === '/gallery' ||
            location.pathname === '/short' ||
            open
              ? 'dark:text-mountain-50 text-mountain-950 border-indigo-300'
              : `dark:border-mountain-950 dark:text-mountain-500 text-mountain-700 border-white`
          } `}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div
            className={`hover:bg-mountain-100 dark:hover:bg-mountain-1000 hidden items-center space-x-1 md:flex lg:space-x-2 ${open && 'dark:bg-mountain-1000 bg-mountain-100'} dark:hover:text-mountain-50 mt-1 rounded-lg p-2 hover:cursor-pointer`}
          >
            {location.pathname === '/gallery' ||
            location.pathname === '/short' ? (
              <MdExplore className="h-6 w-6" />
            ) : (
              <MdOutlineExplore className="h-6 w-6" />
            )}
            <p className="text-sm">Explore</p>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="dark:bg-mountain-900 border-mountain-100 dark:border-mountain-700 ml-10 w-36 space-y-2 bg-white p-0 py-2"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <Link
          to="/gallery"
          className={`flex ${location.pathname === '/gallery' ? 'bg-mountain-50 dark:bg-mountain-800' : 'dark:bg-mountain-900 bg-white'} hover:bg-mountain-50 dark:hover:bg-mountain-800 w-full items-center space-x-2 p-3 py-2`}
        >
          <Image className="size-4" />
          <p className="text-sm">Gallery</p>
        </Link>
        <Link
          to="/short"
          className={`flex ${location.pathname === '/short' ? 'bg-mountain-50 dark:bg-mountain-800' : 'dark:bg-mountain-900 bg-white'} hover:bg-mountain-50 dark:hover:bg-mountain-800 w-full items-center space-x-2 p-3 py-2`}
        >
          <Video className="size-4" />
          <p className="text-sm">Short</p>
        </Link>
      </PopoverContent>
    </Popover>
  );
};

export default ExploreNavigation;
