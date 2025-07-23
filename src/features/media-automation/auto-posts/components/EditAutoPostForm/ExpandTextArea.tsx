import { Typography } from '@mui/material';
import parse from 'html-react-parser';
import React, { useState } from 'react';

interface PostContentProps {
  content: string;
  limit?: number;
}

export const ExpandablePostContent: React.FC<PostContentProps> = ({
  content,
  limit = 250,
}) => {
  const [expanded, setExpanded] = useState(false);

  const rawText = content.replace(/<[^>]+>/g, ''); // strip HTML tags for length check

  const shouldTruncate = rawText.length > limit;

  const displayedContent = expanded
    ? parse(content)
    : parse(rawText.slice(0, limit) + '...');

  return (
    <div className="p-4 pt-0 text-gray-800 text-base">
      <Typography
        variant="body2"
        component="div"
        sx={{ whiteSpace: 'pre-line' }}
      >
        {displayedContent}
        {shouldTruncate && (
          <span
            onClick={() => setExpanded(!expanded)}
            className="font-medium text-mountain-600 hover:underline cursor-pointer"
          >
            {expanded ? 'See less' : 'See more'}
          </span>
        )}
      </Typography>
    </div>
  );
};
