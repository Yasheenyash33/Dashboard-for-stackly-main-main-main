import React, { useState } from 'react';
import { X, Calendar, Clock, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function CreateSessionModal({ onClose, onSuccess }) {
  const { createSession, users, user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trainee_id: '',
    scheduled_date: '',
    duration_minutes: 60
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sessionData = {
      ...formData,
      trainer_id: user.id,
      scheduled_date: new Date(formData.scheduled_date).toISOString(),
      duration_minutes: parseInt(formData.duration_minutes),
      trainee_id: parseInt(formData.trainee_id)
    };

    const result = await createSession(sessionData);
    if (result) {
      onSuccess();
    } else {
      console.error('Failed to create session');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Create New Session</h2>
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
              Session Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              placeholder="Enter session title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              placeholder="Enter session description"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Trainee
            </label>
            <select
              name="trainee_id"
              value={formData.trainee_id}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
              required
            >
              <option value="">Select a trainee</option>
              {users.filter(u => u.role === 'trainee').map(trainee => (
                <option key={trainee.id} value={trainee.id}>{trainee.first_name} {trainee.last_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Scheduled Date & Time
            </label>
            <input
              type="datetime-local"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              min="15"
              max="480"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Create Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}