import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

//Libs
// import { useInfiniteQuery } from "@tanstack/react-query";
import { Button, Tooltip } from "@mui/material";
import Avatar from "boring-avatars";

//Icons
import { AiOutlineLike } from "react-icons/ai";
import { BiComment } from "react-icons/bi";
import { MdBookmarkBorder } from "react-icons/md";

//Components
import { getPlainTextPreview } from "@/features/blog-details/utils/blog";
import ReactTimeAgo from "react-time-ago";

//Style
type Author = {
  username: string;
  avatar: string;
};

type BlogItemProps = {
  blogId: string;
  author: Author;
  title: string;
  content: string;
  dateCreated: string;
  timeReading: string;
  category: string;
  thumbnail: string;
  like_count: number;
  comment_count: number;
  view_count: number;
};

const BlogItem: React.FC<BlogItemProps> = ({
  blogId,
  author,
  title,
  content,
  dateCreated,
  timeReading,
  category,
  thumbnail,
  like_count,
  comment_count,
}) => {
  const navigate = useNavigate();
  const handleCardClick = () => {
    navigate(`/blogs/${blogId}`);
  };
  const [open, setOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  // const handleClickMoreButton = (e: React.MouseEvent<HTMLElement>) => {
  //     e.stopPropagation();
  //     setOpen(true);
  // };

  useEffect(() => {
    const handleScroll = () => {
      setOpen(false);
    };

    if (open) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [open]);

  return (
    <div
      key={blogId}
      className="flex space-x-4 bg-white dark:bg-mountain-900 border border-mountain-200 dark:border-mountain-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-lg p-4 w-full transition-colors duration-200"
    >
      <div
        onClick={handleCardClick}
        className="flex bg-black dark:bg-mountain-800 w-64 h-48 rounded-lg overflow-hidden cursor-pointer shrink-0"
      >
        <img
          src={thumbnail}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 ease-in-out transform"
          alt={title}
        />
      </div>
      <div className="flex w-full">
        <div className="flex flex-col justify-between space-y-2 w-full">
          <div className="flex justify-between w-full">
            <div className="flex items-center space-x-2 font-thin capitalize text-mountain-600 dark:text-mountain-400">
              <p>{category.trim() ? category : "Uncategorized"}</p>
              <span>•</span>
              <p>{timeReading}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Tooltip title="Bookmark">
                <div className="font-normal text-mountain-400 dark:text-mountain-500 hover:text-mountain-950 dark:hover:text-mountain-100 cursor-pointer transition-colors">
                  <MdBookmarkBorder className="mr-1 size-5" />
                </div>
              </Tooltip>
            </div>
          </div>
          <p
            className="font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-lg line-clamp-1 duration-300 ease-in-out cursor-pointer transform"
            onClick={handleCardClick}
          >
            {title}
          </p>
          <p className="text-sm line-clamp-2 text-gray-600 dark:text-gray-400">
            {getPlainTextPreview(content)}
          </p>
          <div className="flex justify-between w-full">
            <div className="flex items-center space-x-2">
              {author.avatar && !avatarError ? (
                <img
                  src={author.avatar}
                  className="rounded-full w-12 h-12 border border-gray-200 dark:border-mountain-700"
                  alt={author.username}
                  onError={handleAvatarError}
                />
              ) : (
                <Avatar
                  name={author.username || "Unknown"}
                  size={48}
                  variant="beam"
                  colors={["#84bfc3", "#ff9b62", "#d96153"]}
                />
              )}
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {author.username}
              </p>
              <span className="text-gray-500 dark:text-gray-500">•</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {dateCreated && !isNaN(new Date(dateCreated).getTime()) ? (
                  <ReactTimeAgo date={new Date(dateCreated)} locale="en-US" />
                ) : (
                  "Unknown time"
                )}
              </span>
            </div>
            <div className="flex items-center w-fit">
              <Tooltip title="Like">
                <Button className="h-full font-normal text-mountain-400 dark:text-mountain-500 hover:text-mountain-950 dark:hover:text-mountain-100">
                  <AiOutlineLike className="mr-1 size-4" />
                  <p>{like_count}</p>
                </Button>
              </Tooltip>
              <Tooltip title="Comment">
                <Button className="h-full font-normal text-mountain-400 dark:text-mountain-500 hover:text-mountain-950 dark:hover:text-mountain-100">
                  <BiComment className="mr-1 size-4" />
                  <p>{comment_count}</p>
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogItem;
