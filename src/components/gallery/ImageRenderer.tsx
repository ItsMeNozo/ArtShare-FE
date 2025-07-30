import { formatCount } from '@/utils/common';
import { Tooltip } from '@mui/material';
import { Images } from 'lucide-react';
import { AiOutlineLike } from 'react-icons/ai';
import { BiCommentDetail } from 'react-icons/bi';
import { HiOutlineEye } from 'react-icons/hi';
import { RenderPhotoContext } from 'react-photo-album';
import { Link } from 'react-router-dom';
import { GalleryPhoto } from './Gallery';

export const ImageRenderer = (
  _: unknown,
  context: RenderPhotoContext<GalleryPhoto>,
) => {
  const { photo, height, width, index } = context;

  const imageClassName = `w-full h-full object-cover rounded-lg ${photo.isMature ? 'filter blur-md' : ''
    }`;
  return (
    <div
      className="group relative rounded-lg overflow-hidden cursor-pointer"
      style={{
        height: height,
        width: width,
      }}
    >
      <Link to={`/posts/${photo.postId}`} className="block w-full h-full">
        <img
          src={photo.src}
          srcSet={
            Array.isArray(photo.srcSet) ? photo.srcSet.join(', ') : photo.srcSet
          }
          alt={photo.alt || `Image ${index}`}
          className={imageClassName}
        />

        {/* Mature Content Warning Overlay */}
        {photo.isMature && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/60 p-4 rounded-lg text-white pointer-events-none">
            <p className="font-light text-sm text-center uppercase">
              Mature Content
            </p>
          </div>
        )}

        {/* Info Overlay (visible on hover) */}
        <div className="z-10 absolute inset-0 flex flex-col justify-end items-start bg-gradient-to-b from-transparent via-transparent to-black/70 opacity-0 group-hover:opacity-100 p-4 rounded-lg text-white transition-opacity duration-300">
          <div className="top-2 left-2 absolute flex justify-center items-center gap-2">
            {photo.postLength > 1 ? (
              <div className="bg-black/40 p-1.5 rounded-full">
                <Images size={14} />
              </div>
            ) : (
              <></>
            )}

            {photo.aiCreated && (
              <Tooltip title="Created by ArtNova" arrow>
                <img
                  src="/logo_app_v_101.png"
                  alt="Created by ArtNova"
                  className="border border-mountain-700 rounded-full w-6 h-6"
                />
              </Tooltip>
            )}
          </div>

          <div className="flex justify-between items-end gap-2 w-full">
            <div title={`${photo.title}\n${photo.author}`} className='flex flex-col text-left'>
              <span className="font-semibold text-sm line-clamp-1">
                {photo.title}
              </span>
              <span className="text-xs line-clamp-1">{photo.author}</span>
            </div>
            <div className="flex flex-col items-end space-y-0.5">
              <div className="flex items-center space-x-1">
                <p className="font-medium text-xs">
                  {formatCount(photo.likeCount)}
                </p>
                <AiOutlineLike className="size-3.5" />
              </div>
              <div className="flex items-center space-x-1">
                <p className="font-medium text-xs">
                  {formatCount(photo.commentCount)}
                </p>
                <BiCommentDetail className="size-3.5 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                <p className="font-medium text-xs">
                  {formatCount(photo.viewCount)}
                </p>
                <HiOutlineEye className="size-3.5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
