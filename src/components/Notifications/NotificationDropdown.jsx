import React from 'react';
import { Bell, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function NotificationDropdown({ onClose }) {
  const { notifications, markNotificationAsRead } = useAuth();

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id);
    
    if (notification.type === 'session-reminder' && notification.session?.classLink) {
      window.open(notification.session.classLink, '_blank');
      toast.success('Joining session...');
    }
    
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-50">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Bell className="h-4 w-4 text-green-400" />
          <h3 className="text-sm font-medium text-white">Notifications</h3>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-400 text-sm">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`
                p-4 border-b border-gray-700 cursor-pointer transition-colors duration-200 hover:bg-gray-700
                ${notification.read ? 'opacity-60' : ''}
              `}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {notification.type === 'session-reminder' ? (
                    <Clock className="h-5 w-5 text-green-400" />
                  ) : (
                    <Bell className="h-5 w-5 text-blue-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {format(notification.timestamp, 'MMM d, h:mm a')}
                      </p>
                    </div>
                    {notification.session?.classLink && (
                      <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}