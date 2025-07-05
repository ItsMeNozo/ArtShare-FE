import { HorizontalSlider } from '@/components/sliders/HorizontalSlider';
import { getPosts } from '@/features/explore/api/get-post';
import { Post } from '@/types';
import { useEffect, useState } from 'react';

const RecentPost = () => {
  const [posts, setPosts] = useState<Post[] | null>([]);
  const getCurrentPosts = async () => {
    const posts = await getPosts('trending', {
      page: 1,
    });

    setPosts(posts.data);
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
        className={`rounded-lg"} relative flex h-86 w-72 cursor-pointer flex-col items-center justify-center`}
        title={post.title}
      >
        {post.thumbnailUrl && (
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="dark:border-mountain-700 aspect-[1/1] h-full w-fit rounded-lg border object-cover object-center"
            loading="lazy"
          />
        )}
        <span className="absolute z-50 text-sm font-medium text-mountain-50 dark:text-mountain-200 bottom-2 left-2 line-clamp-2">
          {post.user.username}
        </span>
      </div>
    );
  };
  return (
    <HorizontalSlider
      data={posts!}
      renderItem={renderPostItem}
      getItemId={getPostId}
      variant="overlay"
    />
  );
};

export default RecentPost;
