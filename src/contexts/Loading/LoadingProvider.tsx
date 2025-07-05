import { Backdrop, CircularProgress, Typography } from '@mui/material';
import { ReactNode, useMemo, useState } from 'react';
import { LoadingContext, LoadingContextType } from './LoadingContext';

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Processing...');

  const value: LoadingContextType = useMemo(
    () => ({
      showLoading: (msg = 'Processing...') => {
        setMessage(msg);
        setIsLoading(true);
      },
      hideLoading: () => {
        setIsLoading(false);
      },
    }),
    [],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && (
        <Backdrop
          open={true}
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.modal + 9999,
            position: 'fixed',
            inset: 0,
            flexDirection: 'column',
            backdropFilter: 'blur(3px)',
          }}
        >
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
            {message}
          </Typography>
        </Backdrop>
      )}
    </LoadingContext.Provider>
  );
};
