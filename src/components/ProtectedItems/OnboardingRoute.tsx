import { useUser } from '@/contexts/user/useUser';
import React from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

export default function OnboardingRoute({ children }: Props) {
  const { loading, isAuthenticated, isOnboard } = useUser();

  if (loading) return <div>Checking auth…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isOnboard) return <Navigate to="/explore" replace />;
  return <>{children}</>;
}
