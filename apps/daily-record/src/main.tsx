import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import RequireAuth from './auth/RequireAuth';
import CategoriesPage from './pages/CategoriesPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminHomePage from './pages/AdminHomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import StatsPage from './pages/StatsPage';
import SearchPage from './pages/SearchPage';
import PairPage from './pages/PairPage';
import PairEventsPage from './pages/PairEventsPage';
import RootRedirect from './pages/RootRedirect';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
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
              <ProfilePage />
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
              <AdminUsersPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
