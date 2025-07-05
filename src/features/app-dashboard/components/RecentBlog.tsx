// import BlogCard from "@/components/cards/BlogCard"; // Not used here
import BlogItem from '@/components/lists/BlogItem';
import { fetchBlogs } from '@/features/browse-blogs/api/fetch-blogs.api';
import { Blog } from '@/types/blog'; // Adjust path
import { CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';

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
      <div className="sidebar flex h-full w-full items-center justify-center space-x-4">
        <CircularProgress size={36} />
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sidebar flex h-full w-full items-center justify-center text-red-500">
        <p>Error loading recent blogs: {(error as Error).message}</p>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="sidebar flex h-full w-full items-center justify-center">
        <p>No recent blogs found.</p>
      </div>
    );
  }

  return (
    // Removed outer loading check as useQuery's isLoading handles it
    <div className="flex h-fit overflow-hidden rounded-t-3xl pb-20">
      <div className="relative flex h-full w-full flex-1 flex-col">
        <div ref={blogAreaRef} className="flex flex-col space-y-6 gap-y-4 py-4">
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
                avatar: blog.user.profile_picture_url ?? '',
              }}
              timeReading={`${Math.ceil((blog.content ? blog.content.split(/\s+/).length : 0) / 200)}m reading`}
              dateCreated={blog.created_at}
              category={blog.categories?.[0]?.name ?? 'Uncategorized'}
              like_count={blog.like_count}
              comment_count={blog.comment_count}
              view_count={blog.view_count}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentBlog;
