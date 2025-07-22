import { BiComment, BiDesktop, BiLike, BiMobile, BiShare } from 'react-icons/bi';
import { IoEarthSharp } from 'react-icons/io5';
import { MdMoreHoriz } from 'react-icons/md';
import { ExpandablePostContent } from './ExpandTextArea';
import { useState } from 'react';

interface FacebookPostPreviewProps {
  content: string;
  images: string[];
}

export const FacebookPostPreview: React.FC<FacebookPostPreviewProps> = ({
  content,
  images,
}) => {
  const [desktopMode, setDesktopMode] = useState(true);
  return (
    <div className="flex flex-1 justify-center p-4 overflow-y-auto custom-scrollbar">
      <div className='flex flex-col space-y-4'>
        <div className='flex items-center space-x-2'>
          <div className='flex items-center space-x-2 bg-white shadow-sm p-2 py-2.5 rounded-md w-56 text-sm'>
            <img
              src={'/public/fb_icon.svg'}
              alt="Facebook Logo"
              className="w-auto h-8"
            />
            <p className='font-medium'>Facebook Feed Preview</p>
          </div>
          <div className='flex bg-mountain-100 shadow p-0.5 rounded-lg w-24 h-full'>
            <button type='button' onClick={() => setDesktopMode(!desktopMode)} className='flex justify-center items-center bg-white rounded-lg w-1/2 h-full'>
              <BiDesktop className='size-5' />
            </button>
            <button type='button' onClick={() => setDesktopMode(!desktopMode)} className='flex justify-center items-center rounded-lg w-1/2 h-full'>
              <BiMobile className='size-5' />
            </button>
          </div>
        </div>
        <div
          className="flex flex-col space-y-2 bg-white shadow-md rounded-lg w-[680px] h-fit"
        >
          <div className="flex justify-between items-center p-4 pb-0">
            <div className="flex items-center space-x-2">
              <img
                src={'/public/fb_icon.svg'}
                alt="Avatar"
                className="rounded-full w-10 h-10"
              />
              <div className="flex flex-col">
                <p className="font-medium">Sample Page</p>
                <div className="flex space-x-2 text-mountain-400 text-xs">
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
            className={`border-mountain-200 grid max-h-[680px] w-full gap-1 overflow-hidden border-b ${images.length === 0 ? 'hidden' : images.length === 1
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
                className={`h-full w-full object-cover ${images.length === 3 && index === 0 ? 'col-span-2' : ''
                  }`}
              />
            ))}
          </div>
          <div className="flex justify-center items-center p-4 border-mountain-200 border-t w-full">
            <div className="flex justify-center items-center space-x-2 w-1/3">
              <BiLike className="size-5 text-mountain-600" />
              <p className="text-mountain-600 text-sm">Like</p>
            </div>
            <div className="flex justify-center items-center space-x-2 w-1/3">
              <BiComment className="size-5 text-mountain-600" />
              <p className="text-mountain-600 text-sm">Comment</p>
            </div>
            <div className="flex justify-center items-center space-x-2 w-1/3">
              <BiShare className="size-5 text-mountain-600" />
              <p className="text-mountain-600 text-sm">Share</p>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};
