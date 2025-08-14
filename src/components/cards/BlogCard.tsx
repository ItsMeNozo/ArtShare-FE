import { Button, IconButton, Tooltip } from '@mui/material';
import Avatar from 'boring-avatars';
import React, { useState } from 'react';
import { AiOutlineLike } from 'react-icons/ai';
import { BiComment } from 'react-icons/bi';
import { LuLink } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
// import { MdBookmarkBorder } from "react-icons/md";
// Remove the Share import since we're replacing it
// import Share from "../dialogs/Share";
import ReactTimeAgo from 'react-time-ago';

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
  likeCount: number;
  commentCount: number;
  viewCount: number;
  className?: string;
};

const BlogCard: React.FC<BlogCardProps> = ({
  blogId,
  author,
  title,
  content,
  dateCreated,
  timeReading,
  // category,
  thumbnail,
  likeCount,
  commentCount,
  className = '',
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
        `${window.location.origin}/blogs/${blogId}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div
      className={`dark:bg-mountain-900 border-mountain-200 dark:border-mountain-700 flex h-[420px] w-full cursor-pointer flex-col overflow-hidden rounded-lg border bg-white transition-colors duration-200 hover:border-indigo-400 dark:hover:border-indigo-500 ${className}`}
      onClick={handleCardClick}
    >
      {/* Reduced height thumbnail container */}
      <div className="relative bg-gray-100 dark:bg-mountain-800 w-full h-40 overflow-hidden">
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
          <div className="flex items-center space-x-2 text-mountain-600 dark:text-mountain-400 text-sm">
            {/* <p className="capitalize">{category}</p>
            <span>•</span> */}
            <p>{timeReading}</p>
          </div>
          <div
            className="flex items-center space-x-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title={copied ? 'Link copied!' : 'Copy link'} arrow>
              <IconButton
                onClick={handleCopyLink}
                className="text-mountain-400 hover:text-mountain-950 dark:hover:text-mountain-100 dark:text-mountain-500 transition-colors"
                size="small"
              >
                <LuLink className="size-4" />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Title - reduced height */}
        <h3 className="mb-1.5 min-h-[3rem] font-medium text-gray-900 hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-gray-100 text-lg line-clamp-2">
          {title}
        </h3>

        {/* Content preview - reduced to 2 lines */}
        <p className="flex-1 mb-3 text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
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
                className="border border-gray-200 dark:border-mountain-700 rounded-full w-7 h-7"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Avatar
                size={28}
                name={author.username || 'Unknown'}
                variant="beam"
                colors={['#84bfc3', '#fff5d6', '#ffb870', '#d96153', '#000511']}
              />
            )}
            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
              {author.username}
            </p>
            <span className="text-gray-500 dark:text-gray-500">•</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs truncate">
              {dateCreated && !isNaN(new Date(dateCreated).getTime()) ? (
                <ReactTimeAgo
                  className="capitalize"
                  date={new Date(dateCreated)}
                  locale="en-US"
                  timeStyle="round-minute"
                  tick={false}
                />
              ) : (
                'Unknown time'
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
                <Button className="p-1 min-w-0 text-mountain-400 hover:text-mountain-950 dark:hover:text-mountain-100 dark:text-mountain-500">
                  <AiOutlineLike className="mr-1 size-4" />
                  <span className="text-sm">{likeCount}</span>
                </Button>
              </Tooltip>
              <Tooltip title="Comment">
                <Button className="p-1 min-w-0 text-mountain-400 hover:text-mountain-950 dark:hover:text-mountain-100 dark:text-mountain-500">
                  <BiComment className="mr-1 size-4" />
                  <span className="text-sm">{commentCount}</span>
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
