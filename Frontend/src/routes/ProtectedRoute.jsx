import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart3 } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0e17] flex flex-col items-center justify-center text-gray-900 dark:text-white">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-14 h-14 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <BarChart3 className="w-6 h-6 text-cyan-500 absolute" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide">Initializing Terminal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
};
