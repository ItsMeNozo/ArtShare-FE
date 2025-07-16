import { HorizontalSlider } from '@/components/sliders/HorizontalSlider';
import { Skeleton } from '@/components/ui/skeleton';
import { getPosts } from '@/features/explore/api/get-post';
import { Post } from '@/types';
import { useEffect, useState } from 'react';

const RecentPost = () => {
  const [posts, setPosts] = useState<Post[] | null>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentPosts = async () => {
    setIsLoading(true);
    const posts = await getPosts('trending', { page: 1 });
    setPosts(posts.data);
    setIsLoading(false);
  };

  useEffect(() => {
    getCurrentPosts();
  }, []);

  const getPostId = (post: Post) => {
    return post.id;
  };

  const renderPostItem = (post: Post) => {
    return (
      <div
        className={`rounded-lg relative flex h-86 w-72 cursor-pointer flex-col items-center justify-center`}
        title={post.title}
      >
        {post.thumbnailUrl && (
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="border dark:border-mountain-700 rounded-lg w-fit h-full object-center object-cover aspect-[1/1]"
            loading="lazy"
          />
        )}
        <span className="bottom-2 left-2 z-50 absolute font-medium text-mountain-50 dark:text-mountain-200 text-sm line-clamp-2">
          {post.user.username}
        </span>
      </div>
    );
  };
  return (
    <>
      {isLoading ? (
        <div className="flex space-x-4 overflow-x-auto">
          {[...Array(3)].map((_, idx) => (
            <Skeleton key={idx} className="bg-mountain-200 rounded-lg w-72 h-86 shrink-0" />
          ))}
        </div>
      ) : (
        <HorizontalSlider
          data={posts!}
          renderItem={renderPostItem}
          getItemId={getPostId}
          variant="overlay"
        />
      )}
    </>
  );
};

export default RecentPost;
