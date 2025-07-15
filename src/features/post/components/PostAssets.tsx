import { MediaDto } from '@/types';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

const PostAssets = ({ medias }: { medias: MediaDto[] }) => {
  if (!medias || medias.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center bg-white md:shadow pb-4 rounded-2xl w-full md:h-full text-gray-500">
        No assets available for this post.
      </div>
    );
  }

  return (
    <PhotoProvider maskOpacity={0.9}>
      <div
        className={`flex flex-col items-center ${medias.length === 1 && 'justify-center'} dark:bg-mountain-950 no-scrollbar w-full overflow-y-auto rounded-2xl bg-white pb-4 md:h-full md:shadow`}
      >
        {medias.map((media) => (
          <div
            key={media.url}
            className={`flex max-h-full w-full justify-center pt-4 md:px-4 ${media.mediaType === 'image' ? 'hover:cursor-zoom-in' : ''
              }`}
          >
            {media.mediaType === 'image' ? (
              <PhotoView src={media.url}>
                <img
                  src={media.url}
                  alt={media.description || 'Post asset'}
                  crossOrigin="anonymous"
                  className="max-w-full max-h-[80vh] md:max-h-full object-contain"
                />
              </PhotoView>
            ) : (
              <video
                src={media.url}
                controls
                className="max-w-full max-h-[80vh] md:max-h-full object-contain"
              />
            )}
          </div>
        ))}
      </div>
    </PhotoProvider>
  );
};

export default PostAssets;
