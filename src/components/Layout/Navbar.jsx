import React, { useState } from 'react';
import { Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationDropdown } from '../Notifications/NotificationDropdown';

export function Navbar() {
  const { user, logout, notifications } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <div className="bg-gray-900 shadow-sm border-b border-gray-700">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-white capitalize">
              {user.role} Dashboard
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {user.role === 'trainee' && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-white transition-colors duration-200 relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <NotificationDropdown 
                    onClose={() => setShowNotifications(false)} 
                  />
                )}
              </div>
            )}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-white">{user.name}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                      {user.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}