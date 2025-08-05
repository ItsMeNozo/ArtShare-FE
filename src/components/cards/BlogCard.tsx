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
  category,
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
      <div className="dark:bg-mountain-800 relative h-40 w-full overflow-hidden bg-gray-100">
        <img
          src={thumbnail}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Content container with reduced padding */}
      <div className="flex flex-1 flex-col p-4">
        {/* Header section with reduced margin */}
        <div className="mb-1.5 flex items-start justify-between">
          <div className="text-mountain-600 dark:text-mountain-400 flex items-center space-x-2 text-sm">
            <p className="capitalize">{category}</p>
            <span>•</span>
            <p>{timeReading}</p>
          </div>
          <div
            className="flex items-center space-x-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title={copied ? 'Link copied!' : 'Copy link'} arrow>
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
        <h3 className="mb-1.5 line-clamp-2 min-h-[3rem] text-lg font-medium text-gray-900 hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400">
          {title}
        </h3>

        {/* Content preview - reduced to 2 lines */}
        <p className="mb-3 line-clamp-2 flex-1 text-sm text-gray-600 dark:text-gray-400">
          {content}
        </p>

        {/* Footer section - always at bottom with reduced spacing */}
        <div className="mt-auto">
          {/* Author info with reduced margin */}
          <div className="mb-2 flex items-center space-x-2">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.username}
                className="dark:border-mountain-700 h-7 w-7 rounded-full border border-gray-200"
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
            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
              {author.username}
            </p>
            <span className="text-gray-500 dark:text-gray-500">•</span>
            <span className="truncate text-xs text-gray-500 dark:text-gray-400">
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
            className="flex items-center justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-1">
              <Tooltip title="Like">
                <Button className="text-mountain-400 dark:text-mountain-500 hover:text-mountain-950 dark:hover:text-mountain-100 min-w-0 p-1">
                  <AiOutlineLike className="mr-1 size-4" />
                  <span className="text-sm">{likeCount}</span>
                </Button>
              </Tooltip>
              <Tooltip title="Comment">
                <Button className="text-mountain-400 dark:text-mountain-500 hover:text-mountain-950 dark:hover:text-mountain-100 min-w-0 p-1">
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
