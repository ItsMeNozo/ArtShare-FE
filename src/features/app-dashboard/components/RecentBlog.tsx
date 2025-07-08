// import BlogCard from "@/components/cards/BlogCard"; // Not used here
import { useRef } from "react";
import { CircularProgress } from "@mui/material";
import BlogItem from "@/components/lists/BlogItem";
import { useQuery } from "@tanstack/react-query";
import { Blog } from "@/types/blog"; // Adjust path
import { fetchBlogs } from "@/features/browse-blogs/api/fetch-blogs.api";

const RecentBlog = () => {
  const blogAreaRef = useRef<HTMLDivElement>(null);

  // Fetch 3 most recent blogs
  const {
    data: blogs = [],
    isLoading,
    error,
  } = useQuery<Blog[]>({
    queryKey: ["recentBlogs"],
    queryFn: async () => {
      const response = await fetchBlogs("trending", { page: 1, limit: 3 });
      return response.data;
    },
    retry: 1, // Only retry once
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center space-x-4 w-full h-full sidebar">
        <CircularProgress size={36} />
        <p>Loading...</p>
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
                  : "https://placehold.co/600x400"
              }
              author={{
                username: blog.user.username,
                avatar: blog.user.profile_picture_url ?? "",
              }}
              timeReading={`${Math.ceil((blog.content ? blog.content.split(/\s+/).length : 0) / 200)}m reading`}
              dateCreated={blog.created_at}
              category={blog.categories?.[0]?.name ?? "Uncategorized"}
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
