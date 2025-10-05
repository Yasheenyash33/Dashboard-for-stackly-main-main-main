import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { Login } from './components/Auth/Login';
import { ChangePassword } from './components/Auth/ChangePassword';
import { Layout } from './components/Layout/Layout';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { TrainerDashboard } from './components/Dashboard/TrainerDashboard';
import { TraineeDashboard } from './components/Dashboard/TraineeDashboard';
import { SessionManagement } from './components/Sessions/SessionManagement';
import { UserManagement } from './components/Users/UserManagement';
import { Analytics } from './components/Analytics/Analytics';
import { Settings } from './components/Settings/Settings';

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  const getDashboardComponent = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'trainer':
        return <TrainerDashboard />;
      case 'trainee':
        return <TraineeDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {getDashboardComponent()}
          </ProtectedRoute>
        } />

        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['admin', 'trainer']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route path="/sessions" element={
          <ProtectedRoute>
            <SessionManagement />
          </ProtectedRoute>
        } />
        
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute roles={['admin']}>
              <Analytics />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute roles={['admin']}>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/calendar" 
          element={
            <div className="text-center py-8">
              <h1 className="text-2xl font-bold text-white mb-4">Calendar View</h1>
              <p className="text-gray-400">Calendar functionality coming soon...</p>
            </div>
          } 
        />

        <Route 
          path="/change-password" 
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1F2937',
                color: '#F9FAFB',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#F9FAFB',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#F9FAFB',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;