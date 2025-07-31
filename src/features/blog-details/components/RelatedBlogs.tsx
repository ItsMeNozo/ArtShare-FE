import BlogCard from '@/components/cards/BlogCard';
import { Blog } from '@/types/blog';
import { CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react'; // Import useEffect
import { LuBookOpenText } from 'react-icons/lu';
import { fetchRelevantBlogs } from '../api/blog';
import { getPlainTextPreview } from '../utils/blog';

interface RelatedBlogsProps {
  currentBlogId: number;
}

const RelatedBlogs = ({ currentBlogId }: RelatedBlogsProps) => {
  const [skip, setSkip] = useState(1);
  const take = 3;

  const {
    data: relatedBlogs = [],
    isLoading,
    isFetching,
    error,
  } = useQuery<Blog[]>({
    queryKey: ['relatedBlogs', currentBlogId, take, skip],
    queryFn: () =>
      fetchRelevantBlogs(currentBlogId, { limit: take, page: skip }),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });

  const handleNext = () => {
    setSkip((prev) => prev + take);
  };

  const handlePrevious = () => {
    setSkip((prev) => Math.max(0, prev - take));
  };

  const isLastPage = relatedBlogs.length < take;
  const isFirstPage = skip === 1 && relatedBlogs.length > 0;
  const hasNoPages = relatedBlogs.length === 0;

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] w-full flex-col items-center justify-center space-y-8 pt-8">
        <div className="flex w-full items-center justify-center space-x-2 font-medium text-gray-900 dark:text-gray-100">
          <LuBookOpenText className="text-gray-700 dark:text-gray-300" />
          <p>Loading Related Blogs...</p>
        </div>
        <CircularProgress size={36} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[300px] w-full flex-col items-center justify-center space-y-8 pt-8 text-red-500 dark:text-red-400">
        <p>Error loading related blogs: {(error as Error).message}</p>
      </div>
    );
  }

  if (hasNoPages) {
    return (
      <div className="flex min-h-[300px] w-full flex-col items-center justify-center space-y-8 pt-8">
        <div className="flex w-full items-center justify-center space-x-2 font-medium text-gray-900 dark:text-gray-100">
          <LuBookOpenText className="text-gray-700 dark:text-gray-300" />
          <p>Related Blogs</p>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          No related blogs found.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-8 pt-8">
      <div className="flex w-full items-center justify-center space-x-2 font-medium text-gray-900 dark:text-gray-100">
        <LuBookOpenText className="text-gray-700 dark:text-gray-300" />
        <p>Related Blogs</p>
      </div>
      <div className="relative flex w-full max-w-7xl items-center justify-center gap-6 px-4">
        <button
          onClick={handlePrevious}
          disabled={isFirstPage || isFetching}
          className="bg-mountain-200 dark:bg-mountain-700 hover:bg-mountain-300 dark:hover:bg-mountain-600 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg shadow-md transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft className="size-5 text-white" />
        </button>

        <div className="w-full flex-grow">
          <div
            className={`grid gap-6 transition-opacity duration-300 ${
              isFetching ? 'opacity-50' : 'opacity-100'
            } ${
              relatedBlogs.length === 1
                ? 'mx-auto max-w-sm grid-cols-1'
                : relatedBlogs.length === 2
                  ? 'mx-auto max-w-2xl grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {relatedBlogs.map((blog: Blog) => (
              <div key={blog.id} className="h-full">
                <BlogCard
                  blogId={String(blog.id)}
                  thumbnail={
                    Array.isArray(blog.pictures) && blog.pictures[0]
                      ? blog.pictures[0]
                      : 'https://placehold.co/600x400'
                  }
                  title={blog.title}
                  content={getPlainTextPreview(blog.content)}
                  author={{
                    username: blog.user.username,
                    avatar: blog.user.profilePictureUrl ?? '',
                  }}
                  timeReading={`${Math.ceil((blog.content ? blog.content.split(/\s+/).length : 0) / 200)}m reading`}
                  dateCreated={blog.createdAt}
                  category={blog.categories?.[0]?.name ?? 'Uncategorized'}
                  likeCount={blog.likeCount}
                  commentCount={blog.commentCount}
                  viewCount={blog.viewCount}
                  className="h-full"
                />
              </div>
            ))}
          </div>

          {isLastPage && (
            <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              End of results
            </p>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={isLastPage || isFetching}
          className="bg-mountain-200 dark:bg-mountain-700 hover:bg-mountain-300 dark:hover:bg-mountain-600 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg shadow-md transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowRight className="size-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default RelatedBlogs;
