import { Suspense, lazy } from 'react';
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, RequireAuth, LoginPage, ProfilePage, AdminUsersPage } from '@repo/auth';
import { FullPageLoader, Toaster, addToast } from '@repo/ui';
import { isApiError } from '@repo/api';
import { Navigate, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

const TreeListPage = lazy(() => import('./pages/TreeListPage'));
const TreeDetailPage = lazy(() => import('./pages/TreeDetailPage'));

function formatMutationError(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return '알 수 없는 오류가 발생했습니다';
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
  },
  mutationCache: new MutationCache({
    onError(error) {
      addToast(formatMutationError(error), 'error');
    },
  }),
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
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
        </ErrorBoundary>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
