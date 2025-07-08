import { Link } from 'react-router-dom';

//Icons
import { FaArrowLeftLong } from 'react-icons/fa6';

//Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import UserInAppConfigs from '../../../components/popovers/UserInAppConfigs';

//Context
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/user/useUser';
import { Tooltip } from '@mui/material';
import { useState } from 'react';
import { PiStarFourFill } from 'react-icons/pi';
import UserButton from '../../../components/header/user-button';
import TrendingPrompt from './AI/TrendingPrompt';

const AIHeader: React.FC = () => {
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);

  const handleOpenModal = () => {
    setOpen(!open);
  };

  return (
    <nav
      className={`dark:bg-mountain-950 dark:border-b-mountain-700 relative z-50 flex h-14 w-[calc(100vw-360px)] items-center justify-between`}
    >
      <div className="flex w-full items-center justify-between pr-4">
        <div className="flex space-x-2">
          <Link
            to="/explore"
            className="bg-mountain-50 hover:bg-mountain-100/80 border-mountain-100 flex h-10 items-center rounded-lg border px-4"
          >
            <div className="hover:bg-mountain-100 mr-2 flex items-center justify-center rounded-lg">
              <FaArrowLeftLong className="text-mountain-600 size-5" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="flex font-medium">Dashboard</span>
            </div>
          </Link>
        </div>
        <div className="border-mountain-200 flex items-center space-x-4 border-r-1 px-4">
          <Dialog open={open} onOpenChange={handleOpenModal}>
            <DialogTrigger asChild>
              <Tooltip title="See top trending AI prompts">
                <Button className="flex h-10 w-32 cursor-pointer items-center justify-center rounded-lg bg-purple-200 text-sm font-medium text-purple-900 hover:bg-purple-200/80">
                  <PiStarFourFill className="size-6" />
                  Trending AI
                </Button>
              </Tooltip>
            </DialogTrigger>
            <DialogContent className="flex h-[95%] w-[90%] flex-col gap-0 space-y-0 rounded-xl border-0 bg-white p-0">
              <DialogHeader
                hidden
                className="border-mountain-200 flex h-12 border-b-[1px] p-4"
              >
                <DialogTitle className="text-mountain-700 font-normal">
                  ArtShare AI Bot
                </DialogTitle>
                <DialogDescription hidden>Image Description</DialogDescription>
              </DialogHeader>
              <TrendingPrompt onClose={handleOpenModal} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className={`flex h-full items-center space-x-2`}>
        <UserButton user={user!} loading={loading!} />
        <UserInAppConfigs />
      </div>
    </nav>
  );
};

export default AIHeader;
