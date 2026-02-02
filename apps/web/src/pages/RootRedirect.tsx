import React from 'react';
import { Navigate } from 'react-router-dom';
import FullPageLoader from '../components/FullPageLoader';
import { useAuth } from '../auth/AuthContext';

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
