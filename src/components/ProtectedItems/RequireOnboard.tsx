import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@/contexts/UserProvider";
import Loading from "../loading/Loading";

interface Props {
  children: React.ReactNode;
}

export default function RequireOnboard({ children }: Props) {
  const { loading, isAuthenticated, isOnboard } = useUser();

  if (loading) return <Loading />;

  if (isAuthenticated && !isOnboard) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
