// FacebookPostDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { IoEarthSharp } from "react-icons/io5";
import { MdMoreHoriz } from "react-icons/md";
import { BiLike } from "react-icons/bi";
import { ExpandablePostContent } from "./ExpandTextArea";

interface FacebookPostDialogProps {
  open: boolean;
  onClose: () => void;
  content: string;
  images: string[];
}

export const FacebookPostDialog: React.FC<FacebookPostDialogProps> = ({
  open,
  onClose,
  content,
  images,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent hideCloseButton className="bg-[#F2F4F7] p-0 border-mountain-200 rounded-none sm:w-[1024px] h-full overflow-y-auto custom-scrollbar">
        <DialogHeader className="top-0 z-50 sticky flex flex-row justify-between items-center bg-white p-4 border-mountain-200 border-b-1 rounded-t-lg w-full h-16">
          <DialogTitle className="flex items-center space-x-2 font-medium">
            <img src={'/public/fb_icon.svg'} alt="Facebook Logo" className="w-auto h-8" />
            <p>Facebook</p>
          </DialogTitle>
          <p className="font-medium text-lg">Preview Post</p>
          <Button variant={"outline"} className="border-mountain-200 cursor-pointer" onClick={onClose}>
            Close Preview
          </Button>
          <DialogDescription hidden>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center w-full scale-90">
          <div className="flex flex-col space-y-2 bg-white shadow-md rounded-lg w-[680px] h-fit">
            <div className="flex justify-between items-center p-4 pb-0">
              <div className="flex items-center space-x-2">
                <img src={'/public/blank_avatar.png'} alt="Facebook Logo" className="rounded-full w-10 h-10" />
                <div className="flex flex-col">
                  <p className="font-medium">Sample Page</p>
                  <div className="flex items-center space-x-2 text-mountain-400 text-xs">
                    <p>July 1 at 23:15</p>
                    <span>•</span>
                    <IoEarthSharp className="text-mountain-600" />
                  </div>
                </div>
              </div>
              <MdMoreHoriz className="size-6 text-mountain-600" />
            </div>
            <ExpandablePostContent content={content} />
            <div
              className={`grid w-full max-h-[680px] overflow-hidden gap-1 border-b border-mountain-200
                ${images.length === 1
                  ? 'grid-cols-1'
                  : images.length === 2
                    ? 'grid-rows-2'
                    : images.length === 3
                      ? 'grid-rows-[340px_1fr] grid-cols-2'
                      : 'grid-cols-2 grid-rows-2'
                }`}
            >
              {images.slice(0, 4).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Post Image ${index + 1}`}
                  className={`
                    object-cover w-full h-full
                    ${images.length === 3 && index === 0
                      ? 'col-span-2'
                      : ''
                    }
                  `}
                />
              ))}
            </div>
            <div className="flex justify-between items-center px-4 py-2">
              <div className="flex items-center space-x-2">
                <img src="/like_icon.png" className="border border-white rounded-full w-8 h-8" />
                <img src="/love_icon.png" className="-ml-4 border border-white rounded-full w-8 h-8" />
                <p className="text-mountain-600 text-sm">999</p>
              </div>
              <div className="flex items-center space-x-2">
                <p className="flex space-x-1 text-mountain-600 text-sm">
                  <span>100</span>
                  <span>Comments</span>
                </p>
                <p className="flex space-x-1 text-mountain-600 text-sm">
                  <span>100</span>
                  <span>Shares</span>
                </p>
              </div>
            </div>
            <div className="flex justify-center items-center p-4 border-mountain-200 border-t w-full">
              <div className="flex justify-center items-center space-x-2 w-1/3">
                <BiLike className="size-5 text-mountain-600" />
                <p className="text-mountain-600 text-sm">Like</p>
              </div>
              <div className="flex justify-center items-center space-x-2 w-1/3">
                <BiLike className="size-5 text-mountain-600" />
                <p className="text-mountain-600 text-sm">Comment</p>
              </div>
              <div className="flex justify-center items-center space-x-2 w-1/3">
                <BiLike className="size-5 text-mountain-600" />
                <p className="text-mountain-600 text-sm">Share</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
