import { useUser } from '@/contexts/user/useUser';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '../loading/Loading';

interface GuestRouteProps {
  children: React.ReactElement;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (user) {
    return <Navigate to="/explore" replace state={{ from: location }} />;
  }

  return children;
};

export default GuestRoute;
