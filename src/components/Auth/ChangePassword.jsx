import React, { useState } from 'react';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function ChangePassword() {
  const { user, updateUserById } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const result = await updateUserById(user.id, {
        password: passwords.newPassword,
        is_temporary_password: false
      });
      if (result) {
        toast.success('Password updated successfully');
        navigate('/dashboard');
      } else {
        toast.error('Failed to update password');
      }
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Change Password Required</h1>
            <p className="text-gray-400 mt-2">
              You must change your temporary password to continue
            </p>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwords.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors duration-200 z-10"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwords.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors duration-200 z-10"
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                Password Requirements
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li className={`flex items-center ${passwords.newPassword.length >= 6 ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                  At least 6 characters
                </li>
                <li className={`flex items-center ${passwords.newPassword === passwords.confirmPassword && passwords.newPassword ? 'text-green-400' : 'text-gray-400'}`}>
                  <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                  Passwords match
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading || !passwords.newPassword || passwords.newPassword !== passwords.confirmPassword}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              After updating your password, you'll be able to access the dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}