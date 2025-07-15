import { CircularProgress } from '@mui/material';
import React from 'react';
import { MdError } from 'react-icons/md';

interface AsyncWrapperProps {
  loading: boolean;
  error: boolean;
  loadingFallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  children: React.ReactNode;
}

const AsyncWrapper: React.FC<AsyncWrapperProps> = ({
  loading,
  error,
  loadingFallback,
  errorFallback,
  children,
}) => {
  if (loading) return <>{loadingFallback ?? <CircularProgress size={16} />}</>;
  if (error) return <>{errorFallback ?? <MdError color="orange" />}</>;
  return <>{children}</>;
};

export default AsyncWrapper;
