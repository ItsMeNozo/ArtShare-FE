import { Box, Typography } from '@mui/material';
import React from 'react';
import backgroundImg from '../assets/background.png';

const HeroSection: React.FC = () => {
  return (
    <Box
      sx={{
        height: '60px',
        backgroundImage: `url(${backgroundImg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start', // Align text to the left
        pl: '125px', // Add left padding so text isn't flush to the edge
      }}
    >
      <Typography
        sx={{ fontSize: 16, fontWeight: 'bold', color: 'white', lineHeight: 1 }}
      >
        Upload Your Work
      </Typography>
      <Typography
        sx={{
          fontSize: 12,
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 300,
          color: 'white',
          lineHeight: 1,
        }}
      >
        Show the community your blaze
      </Typography>
    </Box>
  );
};

export default HeroSection;
