import { useNumericParam } from '@/hooks/useNumericParam';
import { Box, Tooltip } from '@mui/material';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useGetAutoPosts } from '../../hooks/useGetAutoPosts';
// import { Link, Element } from "react-scroll";

const AutoPostsManagerPage = () => {
  const navigate = useNavigate();
  const projectId = useNumericParam('projectId');
  const postId = useNumericParam('postId');

  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(
    postId ?? null,
  );

  const { data: fetchedPostsResponse } = useGetAutoPosts({
    projectId: projectId,
    orderBy: undefined,
    order: undefined,
    page: 1,
    limit: 10,
  });

  const postList = fetchedPostsResponse?.data ?? [];

  const handleAddPost = () => {
    setSelectedPostIndex(null);
    navigate(`/auto/projects/${projectId}/posts/new`);
  };

  const handlePostItemClick = (postId: number) => {
    setSelectedPostIndex(postId);
    navigate(`/auto/projects/${projectId}/posts/${postId}/edit`);
  };

  return (
    <Box className="flex h-full w-full rounded-t-3xl bg-white">
      {/* Left side for post list */}
      <div className="border-mountain-200 flex h-full w-[25%] flex-col border-r-1">
        <div className="border-mountain-200 flex h-20 w-full items-center justify-between border-b-1 px-2">
          <div className="relative flex gap-4 p-2">
            <p className="text-lg font-medium">Project Posts</p>
          </div>
          <div
            onClick={handleAddPost}
            className="hover:bg-mountain-50/60 flex cursor-pointer items-center space-x-2 rounded-full bg-indigo-100 p-2 px-4 text-sm shadow-sm"
          >
            <Plus />
            <p>New Post</p>
          </div>
        </div>
        <div className="flex flex-col space-y-2 p-2">
          {postList.length > 0 ? (
            postList.map((post) => (
              <div
                key={post.id}
                onClick={() => handlePostItemClick(post.id)}
                className={`flex h-14 w-full shrink-0 cursor-pointer items-center justify-between rounded-md border-1 px-2 shadow-md select-none ${
                  selectedPostIndex === post.id
                    ? 'border-indigo-600 bg-white'
                    : 'border-mountain-200 bg-white hover:bg-gray-100'
                }`}
              >
                <p className="text-mountain-600 line-clamp-1 w-[70%] text-sm">
                  Post {post.id}
                </p>
                <div className="flex items-center space-x-2">
                  <Tooltip title="Delete" arrow placement="bottom">
                    <div className="border-mountain-200 flex h-8 w-8 cursor-pointer items-center justify-center space-x-2 rounded-md border bg-indigo-50 px-2">
                      <Trash2 className="size-4" />
                    </div>
                  </Tooltip>
                </div>
              </div>
            ))
          ) : (
            <p className="text-mountain-600 text-sm">
              This project currently has no post.
            </p>
          )}
        </div>
      </div>
      {/* Right side for gen-post, preview post */}
      <Box className="h-full min-h-0 flex-1">
        {/* if generating -> GenerateAutoPostForm else EditAutoPostForm  */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default AutoPostsManagerPage;
