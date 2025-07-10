import { Link } from "react-router-dom";

//Icons
import { BiExpandAlt } from "react-icons/bi";
import { IoHome } from "react-icons/io5";

//Components
import UserInAppConfigs from "../../../components/popovers/UserInAppConfigs";
import { Button } from "@/components/ui/button";
import UserButton from "../../../components/header/user-button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

//Context
import { useUser } from '@/contexts/user/useUser';
import { LuFile } from "react-icons/lu";
import { MdOutlineSaveAlt } from "react-icons/md";
import { TbSettings2 } from "react-icons/tb";
import { useState } from "react";
interface EditHeaderProps {
  hideTopBar?: boolean;
  setHideTopBar?: React.Dispatch<React.SetStateAction<boolean>>;
  handleDownload?: () => void;
}

const EditHeader: React.FC<EditHeaderProps> = ({
  hideTopBar,
  setHideTopBar,
  handleDownload
}) => {
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);
  const [designName, setDesignName] = useState("");
  const [aspectRatio, setAspectRatio] = useState("Square 1:1");

  return (
    <nav
      className={`z-50 pr-6 border-b-1 bg-white border-mountain-200 w-full flex relative justify-between items-center dark:bg-mountain-950 dark:border-b-mountain-700 h-16
        ${hideTopBar ? "hidden" : ""}
      `}
    >
      <div className="flex justify-between items-center p-4 w-full">
        <div className="flex space-x-4 h-full">
          <Link to="/explore" className="flex items-center bg-mountain-50/60 hover:bg-mountain-100/60/80 shadow-sm px-4 border border-mountain-200 rounded-lg h-10">
            <div className='flex justify-center items-center hover:bg-mountain-100/60 mr-2 rounded-lg'>
              <IoHome className='size-5 text-mountain-600' />
            </div>
            <span className='flex font-medium'>
              Dashboard
            </span>
          </Link>
          <div className="flex border-mountain-200 border-r-1" />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="flex justify-center items-center bg-mountain-50/60 hover:bg-mountain-100/60 shadow-sm border border-mountain-200 rounded-lg w-32 h-10 font-medium text-mountain-950 text-sm cursor-pointer"
              >
                <LuFile className="size-4 text-indigo-600" />
                <p className="ml-2 font-medium">New</p>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Design</DialogTitle>
              </DialogHeader>
              <div className="gap-4 grid py-4">
                <div className="items-center gap-4 grid grid-cols-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g. My Poster Design"
                  />
                </div>
                <div className="items-center gap-4 grid grid-cols-4">
                  <Label htmlFor="ratio" className="text-right">
                    Aspect Ratio
                  </Label>
                  <Input
                    id="ratio"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g. 16:9"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant={"outline"} className="border-mountain-200">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={() => {
                    console.log("Creating new design with:", { designName, aspectRatio });
                    setOpen(false);
                  }}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={() => { }}
            className="flex justify-center items-center bg-mountain-50/60 hover:bg-mountain-100/60 shadow-sm border border-mountain-200 rounded-lg w-32 h-10 font-medium text-mountain-950 text-sm cursor-pointer">
            <TbSettings2 className="size-4 text-purple-600" />
            <p className="font-medium">Settings</p>
          </Button>
          <Button
            onClick={handleDownload}
            className="flex justify-center items-center bg-mountain-50/60 hover:bg-mountain-100/60 shadow-sm border border-mountain-200 rounded-lg w-32 h-10 font-medium text-mountain-950 text-sm cursor-pointer">
            <MdOutlineSaveAlt className="size-4 text-violet-600" />
            <p className="font-medium">Export</p>
          </Button>
        </div>
        <div className="flex items-center space-x-4 px-4 border-mountain-200 border-r-1">
          <Button
            onClick={() => setHideTopBar?.((prev) => !prev)}
            className="flex justify-center items-center bg-mountain-50/60 hover:bg-mountain-100/60 shadow-sm border border-mountain-200 rounded-lg w-32 h-10 font-medium text-mountain-950 text-sm cursor-pointer">
            <BiExpandAlt className="size-4 text-cyan-600" />
            Full Screen
          </Button>
        </div>
      </div>
      <div className={`flex items-center h-full space-x-2`}>
        <UserButton user={user!} loading={loading!} />
        <UserInAppConfigs />
      </div>
    </nav >
  )
}

export default EditHeader;
