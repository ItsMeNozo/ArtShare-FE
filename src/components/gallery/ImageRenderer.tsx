import { formatCount } from "@/utils/common";
import { Images } from "lucide-react";
import { AiOutlineLike } from "react-icons/ai";
import { BiCommentDetail } from "react-icons/bi";
import { HiOutlineEye } from "react-icons/hi";
import { RenderPhotoContext } from "react-photo-album";
import { Link } from "react-router-dom";
import { GalleryPhoto } from "./Gallery";

export const ImageRenderer = (
  _: unknown,
  context: RenderPhotoContext<GalleryPhoto>,
) => {
  const { photo, height, width, index } = context;

  const imageClassName = `w-full h-full object-cover rounded-lg ${
    photo.is_mature ? "filter blur-md" : ""
  }`;

  return (
    <div
      className="relative overflow-hidden rounded-lg cursor-pointer group"
      style={{
        height: height,
        width: width,
      }}
    >
      <Link to={`/posts/${photo.postId}`} className="block w-full h-full">
        <img
          src={photo.src}
          srcSet={
            Array.isArray(photo.srcSet) ? photo.srcSet.join(", ") : photo.srcSet
          }
          alt={photo.alt || `Image ${index}`}
          className={imageClassName}
        />

        {/* Mature Content Warning Overlay */}
        {photo.is_mature && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white rounded-lg pointer-events-none bg-black/60">
            <p className="text-sm font-light text-center uppercase">
              Mature Content
            </p>
          </div>
        )}

        {/* Info Overlay (visible on hover) */}
        <div className="absolute inset-0 z-10 flex flex-col items-start justify-end p-4 text-white transition-opacity duration-300 rounded-lg opacity-0 bg-gradient-to-b from-transparent via-transparent to-black/70 group-hover:opacity-100">
          {photo.postLength > 1 && (
            <div className="absolute flex items-center justify-center gap-2 top-2 left-2">
              <div className="bg-black/40 p-1.5 rounded-full">
                <Images size={14} />
              </div>

              {photo.ai_created && (
                <img
                  src="/logo_app_v_101.png"
                  alt="AI Generated"
                  className="w-6 h-6 border rounded-full border-mountain-700"
                />
              )}
            </div>
          )}

          <div className="flex items-end justify-between w-full gap-2">
            <div title={`${photo.title}\n${photo.author}`}>
              <span className="text-sm font-semibold line-clamp-1">
                {photo.title}
              </span>
              <span className="text-xs line-clamp-1">{photo.author}</span>
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
