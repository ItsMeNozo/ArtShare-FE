import { MediaDto } from '@/types';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

const PostAssets = ({ medias }: { medias: MediaDto[] }) => {
  if (!medias || medias.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center rounded-2xl bg-white pb-4 text-gray-500 lg:h-full lg:shadow">
        No assets available for this post.
      </div>
    );
  }

  return (
    <PhotoProvider maskOpacity={0.9}>
      <div
        className={`flex flex-col items-center ${medias.length === 1 && 'justify-center'} dark:bg-mountain-950 custom-scrollbar rounded-lt-3xl w-full overflow-y-auto bg-white pb-4 lg:h-full lg:shadow`}
      >
        {medias.map((media) => (
          <div
            key={media.url}
            className={`flex max-h-full w-full justify-center px-4 pt-4 ${
              media.mediaType === 'image' ? 'hover:cursor-zoom-in' : ''
            }`}
          >
            {media.mediaType === 'image' ? (
              <PhotoView src={media.url}>
                <img
                  src={media.url}
                  alt={media.description || 'Post asset'}
                  className="max-h-[80vh] max-w-full object-contain lg:max-h-full"
                />
              </PhotoView>
            ) : (
              <video
                src={media.url}
                controls
                className="max-h-[80vh] max-w-full object-contain lg:max-h-full"
              />
            )}
          </div>
        ))}
      </div>
    </PhotoProvider>
  );
};

export default PostAssets;
