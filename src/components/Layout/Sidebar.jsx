import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings,
  Calendar,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = {
  admin: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Sessions', href: '/sessions', icon: BookOpen },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ],
  trainer: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Sessions', href: '/sessions', icon: BookOpen },
    { name: 'My Trainees', href: '/users', icon: UserCheck },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
  ],
  trainee: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Sessions', href: '/sessions', icon: GraduationCap },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
  ]
};

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) return null;
  
  const userNav = navigation[user.role] || [];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-gray-900">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-white">StacklyHub</h1>
        </div>
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {userNav.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive
                      ? 'bg-green-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200
                      ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}
                    `}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}