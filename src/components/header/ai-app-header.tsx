import { Link } from "react-router-dom";

//Icons
import { InfoIcon } from "lucide-react";
import { BiEdit } from "react-icons/bi";
import { FaArrowLeftLong } from "react-icons/fa6";
import { RiImageAiLine } from "react-icons/ri";

//Components
import Tooltip from "@mui/material/Tooltip";
import UserInAppConfigs from "../popovers/UserInAppConfigs";

//Context
import { useUser } from "@/contexts/UserProvider";
import UserButton from "./user-button";

const AIHeader = () => {
  const { user, loading } = useUser();

    return (
        <nav className={`z-50 flex relative justify-between items-center bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-50 dark:bg-mountain-950 px-4 border-b-1 border-b-mountain-100 dark:border-b-mountain-700 w-full h-16`}>
            <div className="flex items-center h-full">
                <Link to="/explore" className='flex justify-center items-center hover:bg-mountain-100 mr-4 p-2 rounded-lg'>
                    <FaArrowLeftLong className='size-5 text-mountain-600' />
                </Link>
                <div className='flex items-center space-x-2'>
                    <span className='flex font-medium text-lg'>
                        Dashboard
                    </span>
                    <Tooltip title={"Return Home"}>
                        <InfoIcon className='size-4' />
                    </Tooltip>
                </div>
            </div>
            <div className="hidden top-1/2 left-1/2 absolute lg:flex justify-between items-center space-x-2 bg-mountain-50 px-1 rounded-2xl w-fit h-10 -translate-x-1/2 -translate-y-1/2">
                {[
                    { label: 'Text To Image', href: '/image/tool/text-to-image', icon: RiImageAiLine },
                    // { label: 'Creative Upscale', href: '/image/tool/upscale', icon: LuImageUpscale },
                    { label: 'Image Editor', href: '/image/tool/editor', icon: BiEdit },
                ].map((item, index) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link key={index} to={item.href} className={`${isActive ? 'text-mountain-950' : 'text-mountain-400'} flex justify-center items-center h-full space-x-2 bg-white shadow py-1.5 rounded-lg w-40 text-mountain-600 hover:text-mountain-950 hover:scale-105 duration-200 ease-in-out hover:cursor-pointer transform`}>
                            <item.icon className='size-4' />
                            <p className='text-sm'>{item.label}</p>
                        </Link>
                    )
                })}
            </div>
            <div className={`flex items-center h-full space-x-2`}>
                <UserButton user={user!} loading={loading!} />
                <UserInAppConfigs />
            </div>
        </nav>
    )
}

export default AIHeader;
