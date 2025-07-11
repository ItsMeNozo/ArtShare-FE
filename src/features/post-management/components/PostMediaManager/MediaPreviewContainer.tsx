import { Box, BoxProps } from '@mui/material';
import React from 'react';

export const MediaPreviewContainer: React.FC<BoxProps> = ({
  children,
  ...props
}) => (
  <Box
    className="bg-mountain-100 flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-500"
    {...props}
  >
    {children}
  </Box>
);
