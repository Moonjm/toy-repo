import { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, RequireAuth, LoginPage, ProfilePage, AdminUsersPage } from '@repo/auth';
import { FullPageLoader } from '@repo/ui';
import { Navigate, Route, Routes } from 'react-router-dom';

const TreeListPage = lazy(() => import('./pages/TreeListPage'));
const TreeDetailPage = lazy(() => import('./pages/TreeDetailPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<FullPageLoader label="불러오는 중..." />}>
          <Routes>
            <Route path="/" element={<Navigate to="/trees" replace />} />
            <Route path="/login" element={<LoginPage redirectTo="/trees" />} />
            <Route
              path="/trees"
              element={
                <RequireAuth allow={['USER', 'ADMIN']}>
                  <TreeListPage />
                </RequireAuth>
              }
            />
            <Route
              path="/trees/:id"
              element={
                <RequireAuth allow={['USER', 'ADMIN']}>
                  <TreeDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="/me"
              element={
                <RequireAuth allow={['USER', 'ADMIN']}>
                  <ProfilePage backTo="/trees" />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RequireAuth allow={['ADMIN']}>
                  <AdminUsersPage backTo="/trees" />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  );
}
