import { RenderPhotoContext } from 'react-photo-album';

import { Link } from 'react-router-dom';
import { UserPhoto } from '../../types';

export const UserPhotoRenderer = (
  _: unknown,
  context: RenderPhotoContext<UserPhoto>,
) => {
  const { photo, height, width, index } = context;

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-lg"
      style={{
        height: height,
        width: width,
      }}
    >
      <Link to={`/u/${photo.username}`} className="block h-full w-full">
        <img
          {...photo}
          srcSet={
            Array.isArray(photo.srcSet) ? photo.srcSet.join(', ') : photo.srcSet
          }
          alt={photo.alt || `Image ${index}`}
          className="h-full w-full rounded-lg object-cover"
        />

        {/* Info Overlay (visible on hover) */}
        <div className="absolute inset-0 z-10 flex flex-col items-start justify-end rounded-lg bg-gradient-to-b from-transparent via-transparent to-black/70 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex w-full items-end justify-between gap-2">
            <div title={`${photo.fullName}\n${photo.username}`}>
              <span className="line-clamp-1 text-sm font-semibold">
                {photo.fullName}
              </span>
              <span className="line-clamp-1 text-xs">{photo.username}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
