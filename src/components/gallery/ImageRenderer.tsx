import { formatCount } from '@/utils/common';
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

  const imageClassName = `w-full h-full object-cover rounded-lg ${
    photo.is_mature ? 'filter blur-md' : ''
  }`;

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-lg"
      style={{
        height: height,
        width: width,
      }}
    >
      <Link to={`/posts/${photo.postId}`} className="block h-full w-full">
        <img
          src={photo.src}
          srcSet={
            Array.isArray(photo.srcSet) ? photo.srcSet.join(', ') : photo.srcSet
          }
          alt={photo.alt || `Image ${index}`}
          className={imageClassName}
        />

        {/* Mature Content Warning Overlay */}
        {photo.is_mature && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/60 p-4 text-white">
            <p className="text-center text-sm font-light uppercase">
              Mature Content
            </p>
          </div>
        )}

        {/* Info Overlay (visible on hover) */}
        <div className="absolute inset-0 z-10 flex flex-col items-start justify-end rounded-lg bg-gradient-to-b from-transparent via-transparent to-black/70 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {photo.postLength > 1 && (
            <div className="absolute top-2 left-2 flex items-center justify-center gap-2">
              <div className="rounded-full bg-black/40 p-1.5">
                <Images size={14} />
              </div>

              {photo.ai_created && (
                <img
                  src="/logo_app_v_101.png"
                  alt="AI Generated"
                  className="border-mountain-700 h-6 w-6 rounded-full border"
                />
              )}
            </div>
          )}

          <div className="flex w-full items-end justify-between gap-2">
            <div title={`${photo.title}\n${photo.author}`}>
              <span className="line-clamp-1 text-sm font-semibold">
                {photo.title}
              </span>
              <span className="line-clamp-1 text-xs">{photo.author}</span>
            </div>
            <div className="flex flex-col items-end space-y-0.5">
              <div className="flex items-center space-x-1">
                <p className="text-xs font-medium">
                  {formatCount(photo.like_count)}
                </p>
                <AiOutlineLike className="size-3.5" />
              </div>
              <div className="flex items-center space-x-1">
                <p className="text-xs font-medium">
                  {formatCount(photo.comment_count)}
                </p>
                <BiCommentDetail className="size-3.5 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                <p className="text-xs font-medium">
                  {formatCount(photo.view_count)}
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
