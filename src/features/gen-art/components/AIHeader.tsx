import { Link } from "react-router-dom";

//Icons
import { FaArrowLeftLong } from "react-icons/fa6";

//Components
import UserInAppConfigs from "../../../components/popovers/UserInAppConfigs";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

//Context
import { useUser } from "@/contexts/UserProvider";
import UserButton from "../../../components/header/user-button";
import { IoMdArrowDropdown } from "react-icons/io";
import {
  HistoryFilter,
} from "./../enum";
import { PiStarFourFill } from "react-icons/pi";
import { useState } from "react";
import TrendingPrompt from "./AI/TrendingPrompt";
import { Tooltip } from "@mui/material";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface AIHeaderProps {
  historyFilter: { label: string; value: string };
  setHistoryFilter: (filter: { label: string; value: string }) => void;
  loading: boolean;
}

const AIHeader: React.FC<AIHeaderProps> = ({ historyFilter, setHistoryFilter }) => {
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);

  const handleOpenModal = () => {
    setOpen(!open);
  };

  return (
    <nav className={`z-50 w-[calc(100vw-360px)] flex relative justify-between items-center dark:bg-mountain-950 dark:border-b-mountain-700 h-14`}>
      <div className="flex justify-between items-center pr-4 w-full">
        <div className="flex space-x-2">
          <Link to="/explore" className="flex items-center bg-mountain-50 hover:bg-mountain-100/80 px-4 border border-mountain-100 rounded-lg h-10">
            <div className='flex justify-center items-center hover:bg-mountain-100 mr-2 rounded-lg'>
              <FaArrowLeftLong className='size-5 text-mountain-600' />
            </div>
            <div className='flex items-center space-x-2'>
              <span className='flex font-medium'>
                Dashboard
              </span>
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-4 px-4 border-mountain-200 border-r-1">
          <div className="flex justify-start items-center space-x-2 bg-mountain-50 hover:bg-mountain-100/80 px-2 border border-mountain-100 rounded-lg w-42 h-10 font-normal">
            <DropdownMenu>
              <DropdownMenuTrigger className="justify-start outline-none w-full hover:cursor-pointer">
                <div className="flex items-center space-x-2">
                  <p className="flex space-x-2">
                    <Clock />{" "}
                    <span className="font-medium">
                      {historyFilter.label}
                    </span>
                  </p>
                  <IoMdArrowDropdown />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="flex flex-col mt-4 border-mountain-200 min-w-48 select-none">
                {Object.values(HistoryFilter).map((filter, index) => (
                  <div
                    key={index}
                    onClick={() => setHistoryFilter(filter)}
                    className={`${loading && "pointer-events-none"} flex p-1.5 hover:bg-mountain-100 hover:cursor-pointer ${historyFilter.value == filter.value
                      ? "bg-indigo-50 font-medium text-mountain-800"
                      : ""
                      }`}
                  >
                    {filter.label}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Dialog open={open} onOpenChange={handleOpenModal}>
            <DialogTrigger asChild>
              <Tooltip title="See top trending AI prompts">
                <Button className="flex justify-center items-center bg-purple-200 hover:bg-purple-200/80 rounded-lg w-32 h-10 font-medium text-purple-900 text-sm cursor-pointer">
                  <PiStarFourFill className="size-6" />
                  Trending AI
                </Button>
              </Tooltip>
            </DialogTrigger>
            <DialogContent className="flex flex-col gap-0 space-y-0 bg-white p-0 border-0 rounded-xl min-w-6xl h-[95%]">
              <DialogHeader
                hidden
                className="flex p-4 border-mountain-200 border-b-[1px] h-12"
              >
                <DialogTitle className="font-normal text-mountain-700">
                  ArtShare AI Bot
                </DialogTitle>
                <DialogDescription hidden>Image Description</DialogDescription>
              </DialogHeader>
              <div className="relative flex h-full">
                <TrendingPrompt onClose={handleOpenModal} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className={`flex items-center h-full space-x-2`}>
        <UserButton user={user!} loading={loading!} />
        <UserInAppConfigs />
      </div>
    </nav >
  )
}

export default AIHeader;
