import { Link } from "react-router-dom";
import { useState } from "react";

//Icons
import { IoHome } from "react-icons/io5";
import { PiStarFourFill } from "react-icons/pi";

//Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@mui/material";
import TrendingPrompt from "./AI/TrendingPrompt";
import UserButton from "../../../components/header/user-button";

//Context
import { useUser } from '@/contexts/user/useUser';
import UserInAppConfigs from "@/components/popovers/UserInAppConfigs";

const AIHeader: React.FC = () => {
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);

  const handleOpenModal = () => {
    setOpen(!open);
  };

  return (
    <nav className={`z-50 w-[calc(100vw-350px)] flex relative justify-between items-center dark:bg-mountain-950 dark:border-b-mountain-700 h-14`}>
      <div className="flex justify-between items-center pr-4 w-full">
        <Link to="/explore" className="flex items-center bg-mountain-50 hover:bg-mountain-100/80 px-4 border border border-mountain-100 border-mountain-200 rounded-lg h-10">
          <div className='flex justify-center items-center hover:bg-mountain-100 mr-2 rounded-lg'>
            <IoHome className='size-5 text-mountain-600' />
          </div>
          <span className='flex font-medium'>
            Dashboard
          </span>
        </Link>
        <div className="flex items-center space-x-4 px-4 border-mountain-200 border-r-1">
          <Dialog open={open} onOpenChange={handleOpenModal}>
            <DialogTrigger asChild>
              <Tooltip title="See top trending AI prompts">
                <Button className="flex justify-center items-center bg-purple-200 hover:bg-purple-200/80 rounded-lg w-32 h-10 font-medium text-purple-900 text-sm cursor-pointer">
                  <PiStarFourFill className="size-6" />
                  Trending AI
                </Button>
              </Tooltip>
            </DialogTrigger>
            <DialogContent className="flex flex-col gap-0 space-y-0 bg-white p-0 border-0 rounded-xl w-[90%] h-[95%]">
              <DialogHeader
                hidden
                className="flex p-4 border-mountain-200 border-b-[1px] h-12"
              >
                <DialogTitle className="font-normal text-mountain-700">
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
