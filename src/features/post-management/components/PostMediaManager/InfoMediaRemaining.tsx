// Core
import { useState } from "react";

// Components
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

//Icons
import { Typography } from "@mui/material";
import { AiOutlineInfo } from "react-icons/ai";

interface InfoMediaRemainingProps {
    currentImageCount: number,
    MaxImage: number,
    hasVideo: boolean,
    MaxVideo: number,
    hasAI: boolean
}

const InfoMediaRemaining: React.FC<InfoMediaRemainingProps> = ({
    currentImageCount,
    MaxImage,
    hasVideo,
    MaxVideo,
    hasAI
}) => {
    const [open, setOpen] = useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
                    className="flex justify-center items-center bg-white shadow-md rounded-full w-8 h-8 hover:cursor-pointer">
                    <AiOutlineInfo className="size-5" />
                </div>
            </PopoverTrigger>
            <PopoverContent side="right"
                className="dark:bg-mountain-900 p-0 border-mountain-100 dark:border-mountain-700 w-fit"
            >
                <div className="flex px-2 py-1">
                    <span className="mr-2 font-medium">Up to: </span>
                    <Typography className="text-gray-900 dark:text-mountain-200 text-base">
                        {currentImageCount}/{MaxImage} images
                    </Typography>

                    {hasAI && <Typography className="text-gray-900 dark:text-mountain-200 text-base">
                        , {hasVideo ? 1 : 0}/{MaxVideo} video
                    </Typography>}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default InfoMediaRemaining;