import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureApi } from '@repo/api';
import { AuthProvider, RequireAuth, LoginPage, AdminUsersPage } from '@repo/auth';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import TreeListPage from './pages/TreeListPage';
import TreeDetailPage from './pages/TreeDetailPage';
import './index.css';

configureApi({
  baseURL: (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, ''),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
  },
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
            path="/admin/users"
            element={
              <RequireAuth allow={['ADMIN']}>
                <AdminUsersPage backTo="/trees" />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
