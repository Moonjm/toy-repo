import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureApi } from '@repo/api';
import { AuthProvider, RequireAuth, LoginPage, ProfilePage, AdminUsersPage } from '@repo/auth';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import AdminHomePage from './pages/AdminHomePage';
import CategoriesPage from './pages/CategoriesPage';
import StatsPage from './pages/StatsPage';
import SearchPage from './pages/SearchPage';
import PairPage from './pages/PairPage';
import PairEventsPage from './pages/PairEventsPage';
import RootRedirect from './pages/RootRedirect';
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
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage redirectTo="/calendar" />} />
          <Route
            path="/calendar"
            element={
              <RequireAuth allow={['USER', 'ADMIN']}>
                <App />
              </RequireAuth>
            }
          />
          <Route
            path="/me"
            element={
              <RequireAuth allow={['USER', 'ADMIN']}>
                <ProfilePage backTo="/calendar" />
              </RequireAuth>
            }
          />
          <Route
            path="/stats"
            element={
              <RequireAuth allow={['USER', 'ADMIN']}>
                <StatsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/search"
            element={
              <RequireAuth allow={['USER', 'ADMIN']}>
                <SearchPage />
              </RequireAuth>
            }
          />
          <Route
            path="/pair"
            element={
              <RequireAuth allow={['USER', 'ADMIN']}>
                <PairPage />
              </RequireAuth>
            }
          />
          <Route
            path="/pair/events"
            element={
              <RequireAuth allow={['USER', 'ADMIN']}>
                <PairEventsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <RequireAuth allow={['ADMIN']}>
                <CategoriesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth allow={['ADMIN']}>
                <AdminHomePage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RequireAuth allow={['ADMIN']}>
                <AdminUsersPage backTo="/admin" />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
