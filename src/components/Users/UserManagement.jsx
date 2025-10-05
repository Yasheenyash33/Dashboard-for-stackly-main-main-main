import React, { useState } from 'react';
import { Plus, CreditCard as Edit, Trash2, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CreateUserModal } from './CreateUserModal';
import { AssignTrainerModal } from './AssignTrainerModal';
import toast from 'react-hot-toast';

export function UserManagement() {
  const { user, users, deleteUser } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState(null);

  const isAdmin = user.role === 'admin';
  const isTrainer = user.role === 'trainer';

  let displayUsers = users;
  if (isTrainer) {
    displayUsers = users.filter(u => u.role === 'trainee' && u.assignedTrainer === user.id);
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const success = await deleteUser(userId);
      if (success) {
        toast.success('User deleted successfully');
      } else {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleAssignTrainer = (trainee) => {
    setSelectedTrainee(trainee);
    setShowAssignModal(true);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-600';
      case 'trainer':
        return 'bg-blue-600';
      case 'trainee':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isTrainer ? 'My Trainees' : 'User Management'}
          </h1>
          <p className="mt-2 text-gray-400">
            {isTrainer 
              ? 'Manage your assigned trainees'
              : 'Manage system users and their roles'
            }
          </p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Create User</span>
          </button>
        )}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Trainer Assignment
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {displayUsers.map((u) => {
                const trainer = users.find(t => t.id === u.assignedTrainer);
                
                return (
                  <tr key={u.id} className="hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{u.name}</div>
                          <div className="text-sm text-gray-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getRoleBadgeColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {u.role === 'trainee' ? (
                          <div className="flex items-center justify-between">
                            <span>
                              {trainer ? trainer.name : 'Unassigned'}
                            </span>
                            <button
                              onClick={() => handleAssignTrainer(u)}
                              className="ml-2 text-blue-400 hover:text-blue-300"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        u.isTemporary 
                          ? 'bg-yellow-600 text-white' 
                          : 'bg-green-600 text-white'
                      }`}>
                        {u.isTemporary ? 'Temporary' : 'Active'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-400 hover:text-red-300 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {displayUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">
                {isTrainer ? 'No trainees assigned to you yet.' : 'No users found.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            toast.success('User created successfully');
          }}
        />
      )}

      {showAssignModal && selectedTrainee && (
        <AssignTrainerModal
          trainee={selectedTrainee}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedTrainee(null);
          }}
          onSuccess={() => {
            setShowAssignModal(false);
            setSelectedTrainee(null);
            toast.success('Trainer assigned successfully');
          }}
        />
      )}
    </div>
  );
}