import { useState } from 'react';
import { Link } from 'react-router-dom';

//Icons
import { IoHome } from 'react-icons/io5';
import { PiStarFourFill } from 'react-icons/pi';

//Components
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tooltip } from '@mui/material';
import UserButton from '../../../components/header/user-button';
import TrendingPrompt from './AI/TrendingPrompt';

//Context
import UserInAppConfigs from '@/components/popovers/UserInAppConfigs';
import { useUser } from '@/contexts/user/useUser';
import { Book } from 'lucide-react';

type AIHeaderProps = {
  onGuideClick: () => void;
};

const AIHeader = ({ onGuideClick }: AIHeaderProps) => {
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);

  const handleOpenModal = () => {
    setOpen(!open);
  };

  return (
    <nav
      className={`dark:bg-mountain-950 dark:border-b-mountain-700 relative z-50 flex h-16 w-[calc(100vw-18rem)] items-center justify-between pr-4`}
    >
      <div className="flex w-full items-center justify-between px-4">
        <Link
          to="/dashboard"
          className="bg-mountain-50 hover:bg-mountain-100/80 border-mountain-100 border-mountain-200 flex h-10 items-center rounded-lg border px-4"
        >
          <div className="hover:bg-mountain-100 mr-2 flex items-center justify-center rounded-lg">
            <IoHome className="text-mountain-600 size-5" />
          </div>
          <span className="flex font-medium">Dashboard</span>
        </Link>
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
          <Button
            onClick={onGuideClick}
            className="hover:bg-mountain-50 border-mountain-200 text-mountain-950 flex h-10 w-24 cursor-pointer items-center justify-center rounded-lg border bg-white text-sm font-medium"
          >
            <Book className="size-6" />
            Guide
          </Button>
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
