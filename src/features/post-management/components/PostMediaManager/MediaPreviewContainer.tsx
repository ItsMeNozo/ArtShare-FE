import React from 'react'
import { Box, BoxProps } from '@mui/material'

export const MediaPreviewContainer: React.FC<BoxProps> = ({ children, ...props }) => (
  <Box
    className="flex flex-col justify-center items-center bg-mountain-100 border border-gray-500 border-dashed rounded-lg w-full h-full"
    {...props}
  >
    {children}
  </Box>
)