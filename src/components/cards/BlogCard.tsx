import { Button, IconButton, Tooltip } from "@mui/material";
import Avatar from "boring-avatars";
import React, { useState } from "react";
import { AiOutlineLike } from "react-icons/ai";
import { BiComment } from "react-icons/bi";
import { LuLink } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
// import { MdBookmarkBorder } from "react-icons/md";
// Remove the Share import since we're replacing it
// import Share from "../dialogs/Share";
import ReactTimeAgo from "react-time-ago";

type Author = {
  username: string;
  avatar: string;
};

type BlogCardProps = {
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
  className?: string;
};

const BlogCard: React.FC<BlogCardProps> = ({
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
  className = "",
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCardClick = () => {
    navigate(`/blogs/${blogId}`);
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(
        `http://localhost:5173/blogs/${blogId}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-mountain-900 border border-mountain-200 dark:border-mountain-700 rounded-lg overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors duration-200 cursor-pointer w-full h-[420px] ${className}`}
      onClick={handleCardClick}
    >
      {/* Reduced height thumbnail container */}
      <div className="relative w-full h-40 bg-gray-100 dark:bg-mountain-800 overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content container with reduced padding */}
      <div className="flex flex-col flex-1 p-4">
        {/* Header section with reduced margin */}
        <div className="flex justify-between items-start mb-1.5">
          <div className="flex items-center space-x-2 text-sm text-mountain-600 dark:text-mountain-400">
            <p className="capitalize">{category}</p>
            <span>•</span>
            <p>{timeReading}</p>
          </div>
          <div
            className="flex items-center space-x-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title={copied ? "Link copied!" : "Copy link"} arrow>
              <IconButton
                onClick={handleCopyLink}
                className="text-mountain-400 dark:text-mountain-500 hover:text-mountain-950 dark:hover:text-mountain-100 transition-colors"
                size="small"
              >
                <LuLink className="size-4" />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Title - reduced height */}
        <h3 className="font-medium text-lg text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 mb-1.5 min-h-[3rem]">
          {title}
        </h3>

        {/* Content preview - reduced to 2 lines */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 flex-1">
          {content}
        </p>

        {/* Footer section - always at bottom with reduced spacing */}
        <div className="mt-auto">
          {/* Author info with reduced margin */}
          <div className="flex items-center space-x-2 mb-2">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.username}
                className="w-7 h-7 rounded-full border border-gray-200 dark:border-mountain-700"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Avatar
                size={28}
                name={author.username || "Unknown"}
                variant="beam"
                colors={["#84bfc3", "#fff5d6", "#ffb870", "#d96153", "#000511"]}
              />
            )}
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {author.username}
            </p>
            <span className="text-gray-500 dark:text-gray-500">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {dateCreated && !isNaN(new Date(dateCreated).getTime()) ? (
                <ReactTimeAgo date={new Date(dateCreated)} locale="en-US" />
              ) : (
                "Unknown time"
              )}
            </span>
          </div>

          {/* Actions */}
          <div
            className="flex justify-between items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-1">
              <Tooltip title="Like">
                <Button className="min-w-0 p-1 text-mountain-400 dark:text-mountain-500 hover:text-mountain-950 dark:hover:text-mountain-100">
                  <AiOutlineLike className="size-4 mr-1" />
                  <span className="text-sm">{like_count}</span>
                </Button>
              </Tooltip>
              <Tooltip title="Comment">
                <Button className="min-w-0 p-1 text-mountain-400 dark:text-mountain-500 hover:text-mountain-950 dark:hover:text-mountain-100">
                  <BiComment className="size-4 mr-1" />
                  <span className="text-sm">{comment_count}</span>
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
