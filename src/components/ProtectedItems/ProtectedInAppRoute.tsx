import { useUser } from '@/contexts/UserProvider';
import React from 'react';
import { Navigate } from 'react-router-dom';
import Loading from '../loading/Loading';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { loading, isAuthenticated } = useUser();

  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
