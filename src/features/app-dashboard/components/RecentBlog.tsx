// import BlogCard from "@/components/cards/BlogCard"; // Not used here
import BlogItem from '@/components/lists/BlogItem';
import { fetchBlogs } from '@/features/browse-blogs/api/fetch-blogs.api';
import { Blog } from '@/types/blog'; // Adjust path
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const RecentBlog = () => {
  const blogAreaRef = useRef<HTMLDivElement>(null);

  // Fetch 3 most recent blogs
  const {
    data: blogs = [],
    isLoading,
    error,
  } = useQuery<Blog[]>({
    queryKey: ['recentBlogs'],
    queryFn: async () => {
      const response = await fetchBlogs('trending', { page: 1, limit: 3 });
      return response.data;
    },
    retry: 1, // Only retry once
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-4 space-y-6 px-4 py-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="rounded-md w-48 h-28" />
            <div className="flex flex-col flex-1 space-y-2">
              <Skeleton className="w-3/4 h-5" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-5/6 h-4" />
              <div className="flex space-x-2 mt-2">
                <Skeleton className="rounded-full w-20 h-6" />
                <Skeleton className="rounded-full w-14 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center w-full h-full text-red-500 sidebar">
        <p>Error loading recent blogs: {(error as Error).message}</p>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="flex justify-center items-center w-full h-full sidebar">
        <p>No recent blogs found.</p>
      </div>
    );
  }

  return (
    // Removed outer loading check as useQuery's isLoading handles it
    <div className="flex pb-20 rounded-t-3xl h-fit overflow-hidden">
      <div className="relative flex flex-col flex-1 w-full h-full">
        <div ref={blogAreaRef} className="flex flex-col gap-y-4 space-y-6 py-4">
          {blogs.map((blog) => (
            <BlogItem
              key={blog.id}
              blogId={String(blog.id)}
              title={blog.title}
              content={blog.content}
              thumbnail={
                Array.isArray(blog.pictures) && blog.pictures[0]
                  ? blog.pictures[0]
                  : 'https://placehold.co/600x400'
              }
              author={{
                username: blog.user.username,
                avatar: blog.user.profilePictureUrl ?? '',
              }}
              timeReading={`${Math.ceil((blog.content ? blog.content.split(/\s+/).length : 0) / 200)}m reading`}
              createdAt={blog.createdAt}
              category={blog.categories?.[0]?.name ?? 'Uncategorized'}
              likeCount={blog.likeCount}
              commentCount={blog.commentCount}
              viewCount={blog.viewCount}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentBlog;
