import React from 'react';
import { Navigate } from 'react-router-dom';
import { FullPageLoader } from '@repo/ui';
import { useAuth } from './AuthContext';

type RequireAuthProps = {
  allow?: string[];
  loginPath?: string;
  homePath?: string;
  children: React.ReactNode;
};

export default function RequireAuth({
  allow,
  loginPath = '/login',
  homePath = '/',
  children,
}: RequireAuthProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to={loginPath} replace />;
  }

  if (allow && !allow.includes(user.authority)) {
    return <Navigate to={homePath} replace />;
  }

  return <>{children}</>;
}
