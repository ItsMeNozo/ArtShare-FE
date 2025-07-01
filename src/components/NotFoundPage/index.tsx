import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
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
            fontSize: { xs: '6rem', sm: '8rem' }, // Responsive font size
            color: 'primary.main',
          }}
        >
          404
        </Typography>

        <Typography
          variant="h4"
          component="h2"
          sx={{ mt: 2, mb: 1, fontWeight: 600 }}
        >
          Page Not Found
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: '480px' }}
        >
          Oops! We couldn't find the page you were looking for. It might have
          been moved or deleted.
        </Typography>

        <Button onClick={handleGoBack} variant="contained" size="large">
          Go Back
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
