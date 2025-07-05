import { Box, Typography } from '@mui/material';
import React from 'react';

const MatureContentPage: React.FC = () => {
  return (
    <Box className="min-h-screen w-full bg-gray-100 p-8">
      <Box className="w-full rounded-md bg-white p-6 shadow-md">
        <Typography variant="h4" className="mb-4 text-gray-800">
          Mature Content & Unsuitable Content Guidelines
        </Typography>
        <Typography variant="body1" className="mb-2 text-gray-700">
          This page outlines our guidelines regarding Mature Content and
          Unsuitable Content. Mature Content includes material that is intended
          for adult audiences and may contain themes, visuals, or language that
          are not suitable for all ages.
        </Typography>
        <Typography variant="body1" className="mb-2 text-gray-700">
          Unsuitable Content refers to any material that violates our community
          standards or legal regulations, including explicit violence, hate
          speech, or content that is offensive or harmful.
        </Typography>
        <Typography variant="body1" className="mb-2 text-gray-700">
          When submitting content, please ensure that any mature material is
          clearly marked. Users are encouraged to review our guidelines to avoid
          posting content that might be deemed inappropriate.
        </Typography>
        <Typography variant="body2" className="mt-4 text-gray-500">
          Note: These guidelines are subject to periodic review and updates to
          ensure a safe and respectful community.
        </Typography>
      </Box>
    </Box>
  );
};

export default MatureContentPage;
