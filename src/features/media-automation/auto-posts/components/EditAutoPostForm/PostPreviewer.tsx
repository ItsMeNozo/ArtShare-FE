import { Platform } from '@/features/media-automation/projects/types/platform';
import { format } from 'date-fns';
import { useState } from 'react';
import {
  BiComment,
  BiDesktop,
  BiLike,
  BiMobile,
  BiShare,
} from 'react-icons/bi';
import { IoEarthSharp } from 'react-icons/io5';
import { MdMoreHoriz } from 'react-icons/md';
import { MobileImageGrid } from '../mimics/MobileImageGrid';
import { ExpandablePostContent } from './ExpandTextArea';
interface FacebookPostPreviewProps {
  content: string;
  images: string[];
  scheduledAt?: Date | null;
  platform?: Platform;
}

const facebookIcon =
  'https://res.cloudinary.com/dqxtf297o/image/upload/v1753263979/artshare-asset/fb_icon_jiqelq.svg';

const SkeletonIconImage = ({ src, alt }: { src: string; alt?: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative flex h-8 w-auto items-center">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse rounded bg-gray-200" />
      )}
      <img
        src={src}
        alt={alt || ''}
        onLoad={() => setLoaded(true)}
        className={`h-8 w-auto transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

export const FacebookPostPreview: React.FC<FacebookPostPreviewProps> = ({
  content,
  images,
  scheduledAt,
  platform,
}) => {
  const [desktopMode, setDesktopMode] = useState(true);
  return (
    <div className="custom-scrollbar flex flex-1 justify-center overflow-y-auto p-4">
      <div className="flex h-full w-[680px] flex-col items-center space-y-4">
        <div className="flex w-full items-center space-x-2">
          <div className="flex w-56 items-center space-x-2 rounded-md bg-white p-2 py-2.5 text-sm shadow-sm">
            <SkeletonIconImage src={facebookIcon} alt="Facebook Icon" />
            <p className="font-medium">Facebook Feed Preview</p>
          </div>
          <div className="bg-mountain-100 flex h-full w-24 rounded-lg p-0.5 shadow">
            <button
              type="button"
              onClick={() => setDesktopMode(!desktopMode)}
              className={`${desktopMode === true ? 'bg-white' : 'group'} flex h-full w-1/2 transform cursor-pointer items-center justify-center rounded-lg duration-300 ease-in-out`}
            >
              <BiDesktop className="size-5 group-hover:text-indigo-600" />
            </button>
            <button
              type="button"
              onClick={() => setDesktopMode(!desktopMode)}
              className={`${desktopMode === false ? 'bg-white' : 'group'} flex h-full w-1/2 transform cursor-pointer items-center justify-center rounded-lg duration-300 ease-in-out`}
            >
              <BiMobile className="size-5 group-hover:text-indigo-600" />
            </button>
          </div>
        </div>
        <div
          className={`bg-mountain-200 flex w-[680px] items-center justify-center rounded-lg shadow-md`}
        >
          <div
            className={`flex h-fit flex-col space-y-2 bg-white ${desktopMode ? 'min-w-[680px] rounded-lg' : 'w-[425px]'}`}
          >
            <div className="flex items-center justify-between p-4 pb-0">
              <div className="flex items-center space-x-2">
                <img
                  src={platform?.pictureUrl || facebookIcon}
                  alt="Avatar"
                  className="h-10 w-10 rounded-full"
                />
                <div className="flex flex-col">
                  <p className="font-medium">
                    {platform?.config?.pageName || 'Facebook Page'}
                  </p>
                  <div className="text-mountain-400 flex space-x-2 text-xs">
                    <p>
                      {scheduledAt
                        ? format(new Date(scheduledAt), 'MMM dd, yyyy HH:mm')
                        : 'Not scheduled'}
                    </p>
                    <span>•</span>
                    <IoEarthSharp className="text-mountain-600" />
                  </div>
                </div>
              </div>
              <MdMoreHoriz className="text-mountain-600 size-6" />
            </div>
            <ExpandablePostContent content={content} />
            <div
              className={`border-mountain-200 w-full overflow-hidden border-b ${images.length === 0 ? 'hidden' : ''}`}
            >
              {desktopMode ? (
                <div
                  className={`grid gap-1 ${
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
                      }`}
                    />
                  ))}
                </div>
              ) : (
                <MobileImageGrid images={images.slice(0, 4)} />
              )}
            </div>
            <div className="border-mountain-200 flex w-full items-center justify-center border-t p-4">
              <div className="flex w-1/3 items-center justify-center space-x-2">
                <BiLike className="text-mountain-600 size-5" />
                <p className="text-mountain-600 text-sm">Like</p>
              </div>
              <div className="flex w-1/3 items-center justify-center space-x-2">
                <BiComment className="text-mountain-600 size-5" />
                <p className="text-mountain-600 text-sm">Comment</p>
              </div>
              <div className="flex w-1/3 items-center justify-center space-x-2">
                <BiShare className="text-mountain-600 size-5" />
                <p className="text-mountain-600 text-sm">Share</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
