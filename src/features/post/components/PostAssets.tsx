import { MediaDto } from '@/types';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

const PostAssets = ({ medias }: { medias: MediaDto[] }) => {
  if (!medias || medias.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center rounded-2xl bg-white pb-4 text-gray-500 md:h-full md:shadow">
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
            className="flex max-h-full w-full justify-center pt-4 hover:cursor-zoom-in md:px-4"
          >
            <PhotoView src={media.url}>
              {media.media_type === 'image' ? (
                <img
                  src={media.url}
                  alt={media.description || 'Post asset'}
                  className="max-h-[80vh] max-w-full object-contain md:max-h-full"
                />
              ) : (
                <video
                  src={media.url}
                  controls
                  className="max-h-[80vh] max-w-full object-contain md:max-h-full"
                />
              )}
            </PhotoView>
          </div>
        ))}
      </div>
    </PhotoProvider>
  );
};

export default PostAssets;
