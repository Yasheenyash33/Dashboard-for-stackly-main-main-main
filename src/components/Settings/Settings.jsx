import React, { useState } from 'react';
import { User, Lock, Settings as SettingsIcon, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    username: user.username
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'password', name: 'Password', icon: Lock },
    { id: 'preferences', name: 'Preferences', icon: SettingsIcon }
  ];

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    if (user.role === 'admin') {
      updateUser(profileData);
      toast.success('Profile updated successfully');
    } else {
      // Non-admin users can only update their name
      updateUser({ name: profileData.name });
      toast.success('Name updated successfully');
    }
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    
    if (passwordData.currentPassword !== user.password) {
      toast.error('Current password is incorrect');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    updateUser({ 
      password: passwordData.newPassword,
      isTemporary: false
    });
    
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    toast.success('Password updated successfully');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-gray-400">Manage your account preferences and security</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  ${activeTab === tab.id
                    ? 'border-green-500 text-green-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className={`
                        w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500
                        ${user.role !== 'admin' ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      disabled={user.role !== 'admin'}
                    />
                    {user.role !== 'admin' && (
                      <p className="text-xs text-gray-400 mt-1">
                        Only administrators can change email addresses
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      className={`
                        w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500
                        ${user.role !== 'admin' ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      disabled={user.role !== 'admin'}
                    />
                    {user.role !== 'admin' && (
                      <p className="text-xs text-gray-400 mt-1">
                        Only administrators can change usernames
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={user.role}
                      className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed capitalize"
                      disabled
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                
                <div className="grid grid-cols-1 gap-6 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white focus:outline-none focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white focus:outline-none focus:border-green-500"
                        required
                        minLength={6}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white focus:outline-none focus:border-green-500"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                  >
                    <Save className="h-4 w-4" />
                    <span>Update Password</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Email Notifications</h4>
                    <p className="text-gray-400 text-sm">Receive email notifications for important updates</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-green-600 transition-colors duration-200 ease-in-out focus:outline-none">
                    <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out"></span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Session Reminders</h4>
                    <p className="text-gray-400 text-sm">Get reminded 15 minutes before sessions start</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-green-600 transition-colors duration-200 ease-in-out focus:outline-none">
                    <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out"></span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Dark Mode</h4>
                    <p className="text-gray-400 text-sm">Use dark theme throughout the application</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-green-600 transition-colors duration-200 ease-in-out focus:outline-none">
                    <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out"></span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}