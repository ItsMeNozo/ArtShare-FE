import { Box, Button, Container, Typography } from '@mui/material';
import { IoIosLock } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

const NoPermission = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // This is the check for the edge case.
    // The history stack length includes the current page. A length of 1 or 2
    // means there's no "real" previous page in this tab's history.
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };
  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          minHeight: '80vh',
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: '32px',
            color: 'primary.main',
          }}
          className='flex flex-col items-center gap-2'
        >
          <IoIosLock className='size-20 primary.main' />
          <p>NO PERMISSION</p>
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          sx={{ mt: 2, mb: 2, fontWeight: 600 }}
        >
          You do not have permission to access this page
        </Typography>
        <Button onClick={handleGoBack} variant="contained" size="large">
          Go Back
        </Button>
      </Box>
    </Container>
  );
};

export default NoPermission;
