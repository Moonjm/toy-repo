import React from 'react';
import { Navigate } from 'react-router-dom';
import FullPageLoader from '../components/FullPageLoader';
import { useAuth } from './AuthContext';

type RequireAuthProps = {
  allow?: string[];
  children: React.ReactNode;
};

export default function RequireAuth({ allow, children }: RequireAuthProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allow && !allow.includes(user.authority)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
