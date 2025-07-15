// FacebookPostDialog.tsx
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BiLike } from 'react-icons/bi';
import { IoEarthSharp } from 'react-icons/io5';
import { MdMoreHoriz } from 'react-icons/md';
import { ExpandablePostContent } from './ExpandTextArea';

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
      <DialogContent
        hideCloseButton
        className="border-mountain-200 custom-scrollbar h-full overflow-y-auto rounded-none bg-[#F2F4F7] p-0 sm:w-[1024px]"
      >
        <DialogHeader className="border-mountain-200 sticky top-0 z-50 flex h-16 w-full flex-row items-center justify-between rounded-t-lg border-b-1 bg-white p-4">
          <DialogTitle className="flex items-center space-x-2 font-medium">
            <img
              src={'/public/fb_icon.svg'}
              alt="Facebook Logo"
              className="h-8 w-auto"
            />
            <p>Facebook</p>
          </DialogTitle>
          <p className="text-lg font-medium">Preview Post</p>
          <Button
            variant={'outline'}
            className="border-mountain-200 cursor-pointer"
            onClick={onClose}
          >
            Close Preview
          </Button>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <div className="flex w-full scale-90 justify-center">
          <div className="flex h-fit w-[680px] flex-col space-y-2 rounded-lg bg-white shadow-md">
            <div className="flex items-center justify-between p-4 pb-0">
              <div className="flex items-center space-x-2">
                <img
                  src={'/public/blank_avatar.png'}
                  alt="Facebook Logo"
                  className="h-10 w-10 rounded-full"
                />
                <div className="flex flex-col">
                  <p className="font-medium">Sample Page</p>
                  <div className="text-mountain-400 flex items-center space-x-2 text-xs">
                    <p>July 1 at 23:15</p>
                    <span>•</span>
                    <IoEarthSharp className="text-mountain-600" />
                  </div>
                </div>
              </div>
              <MdMoreHoriz className="text-mountain-600 size-6" />
            </div>
            <ExpandablePostContent content={content} />
            <div
              className={`border-mountain-200 grid max-h-[680px] w-full gap-1 overflow-hidden border-b ${
                images.length === 1
                  ? 'grid-cols-1'
                  : images.length === 2
                    ? 'grid-rows-2'
                    : images.length === 3
                      ? 'grid-cols-2 grid-rows-[340px_1fr]'
                      : 'grid-cols-2 grid-rows-2'
              }`}
            >
              {images.slice(0, 4).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Post Image ${index + 1}`}
                  className={`h-full w-full object-cover ${
                    images.length === 3 && index === 0 ? 'col-span-2' : ''
                  } `}
                />
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center space-x-2">
                <img
                  src="/like_icon.png"
                  className="h-8 w-8 rounded-full border border-white"
                />
                <img
                  src="/love_icon.png"
                  className="-ml-4 h-8 w-8 rounded-full border border-white"
                />
                <p className="text-mountain-600 text-sm">999</p>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-mountain-600 flex space-x-1 text-sm">
                  <span>100</span>
                  <span>Comments</span>
                </p>
                <p className="text-mountain-600 flex space-x-1 text-sm">
                  <span>100</span>
                  <span>Shares</span>
                </p>
              </div>
            </div>
            <div className="border-mountain-200 flex w-full items-center justify-center border-t p-4">
              <div className="flex w-1/3 items-center justify-center space-x-2">
                <BiLike className="text-mountain-600 size-5" />
                <p className="text-mountain-600 text-sm">Like</p>
              </div>
              <div className="flex w-1/3 items-center justify-center space-x-2">
                <BiLike className="text-mountain-600 size-5" />
                <p className="text-mountain-600 text-sm">Comment</p>
              </div>
              <div className="flex w-1/3 items-center justify-center space-x-2">
                <BiLike className="text-mountain-600 size-5" />
                <p className="text-mountain-600 text-sm">Share</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
