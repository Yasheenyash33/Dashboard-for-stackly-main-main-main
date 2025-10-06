import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export function CreateUserModal({ onClose, onSuccess }) {
  const { createUser, user } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    role: 'trainee',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await createUser({
      ...formData,
      is_temporary_password: true
    });

    if (result) {
      setCreatedUser(result.user);
      setTemporaryPassword(result.temporary_password);
      toast.success('User created successfully!');
    } else {
      // Error is already handled in createUser with toast
      console.error('Failed to create user');
    }
    setIsLoading(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        `Username: ${createdUser.username}\nTemporary Password: ${temporaryPassword}\n\nPlease change your password after first login.`
      );
      setCopied(true);
      toast.success('Credentials copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleClose = () => {
    if (createdUser) {
      onSuccess();
    }
    onClose();
  };

  if (createdUser) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">User Created Successfully</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h3 className="text-green-400 font-medium mb-2">Account Credentials</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-300">Name:</span>
                  <span className="text-white ml-2">{createdUser.name}</span>
                </div>
                <div>
                  <span className="text-gray-300">Username:</span>
                  <span className="text-white ml-2 font-mono">{createdUser.username}</span>
                </div>
                <div>
                  <span className="text-gray-300">Temporary Password:</span>
                  <span className="text-white ml-2 font-mono">{temporaryPassword}</span>
                </div>
                <div>
                  <span className="text-gray-300">Role:</span>
                  <span className="text-white ml-2 capitalize">{createdUser.role}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
              <p className="text-amber-300 text-sm">
                <strong>Important:</strong> Share these credentials securely with the user.
                They will be required to change their password on first login.
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied!' : 'Copy Credentials'}</span>
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Create New User</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              placeholder="Enter first name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              placeholder="Enter last name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
              required
            >
              <option value="trainee">Trainee</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              A secure temporary password will be automatically generated.
              The user will be required to change it on first login.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
