import React from 'react';
import { Navigate } from 'react-router-dom';
import { FullPageLoader } from '@repo/ui';
import { useAuth } from '@repo/auth';

export default function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/calendar" replace />;
}
