import { Platform } from '@/features/media-automation/projects/types/platform';
import { format, isValid } from 'date-fns';
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

  const getFormattedDate = () => {
    if (!scheduledAt) {
      return 'Not scheduled';
    }

    const date = new Date(scheduledAt);

    if (!isValid(date)) {
      return 'Scheduling...';
    }

    return format(date, 'MMM dd, yyyy HH:mm');
  };

  return (
    <div className="custom-scrollbar flex flex-1 justify-center overflow-y-auto p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <div className="flex w-56 items-center space-x-2 rounded-md bg-white p-2 py-2.5 text-sm shadow-sm">
            <SkeletonIconImage src={facebookIcon} alt="Facebook Icon" />
            <p className="font-medium">Facebook Feed Preview</p>
          </div>
          <div className="bg-mountain-100 flex h-full w-24 rounded-lg p-0.5 shadow">
            <button
              type="button"
              onClick={() => setDesktopMode(!desktopMode)}
              className="flex h-full w-1/2 items-center justify-center rounded-lg bg-white"
            >
              <BiDesktop className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setDesktopMode(!desktopMode)}
              className="flex h-full w-1/2 items-center justify-center rounded-lg"
            >
              <BiMobile className="size-5" />
            </button>
          </div>
        </div>
        <div className="flex h-fit w-[680px] flex-col space-y-2 rounded-lg bg-white shadow-md">
          <div className="flex items-center justify-between p-4 pb-0">
            <div className="flex items-center space-x-2">
              <img
                src={platform?.pictureUrl || facebookIcon}
                alt="Avatar"
                className="h-10 w-10 rounded-full"
              />
              <div className="flex flex-col">
                <p className="font-medium">{platform?.config.pageName}</p>
                <div className="text-mountain-400 flex space-x-2 text-xs">
                  <p>{getFormattedDate()}</p>
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
              images.length === 0
                ? 'hidden'
                : images.length === 1
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
  );
};
