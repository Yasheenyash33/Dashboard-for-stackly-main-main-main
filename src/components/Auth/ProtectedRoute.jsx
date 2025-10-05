import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ChangePassword } from './ChangePassword';

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by App component
  }

  // Check if user has temporary password and needs to change it
  if (user.isTemporary) {
    return <ChangePassword />;
  }

  // Check if user has required role
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
}