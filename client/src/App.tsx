import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import LoadingSpinner from './components/LoadingSpinner';
import { Toaster } from 'react-hot-toast';

console.log('App: Loading App component...');

const App: React.FC = () => {
  console.log('App: App component rendering...');
  const { user, isLoading } = useAuth();
  
  console.log('App: Current state - user:', user, 'isLoading:', isLoading);

  if (isLoading) {
    console.log('App: Showing loading spinner...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  console.log('App: Rendering routes...');
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.95)',
            color: '#222',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
            fontSize: '1rem',
            fontWeight: 500,
            padding: '1rem 1.5rem',
            maxWidth: '90vw',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#f87171',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <DashboardPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </div>
  );
};

export default App; 