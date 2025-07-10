import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedAuthRouteProps {
  children: React.ReactNode;
}

const ProtectedAuthRoute: React.FC<ProtectedAuthRouteProps> = ({
  children,
}) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedAuthRoute;
