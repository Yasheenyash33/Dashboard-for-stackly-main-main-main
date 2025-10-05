import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function AssignTrainerModal({ trainee, onClose, onSuccess }) {
  const { users, updateUserById } = useAuth();
  const [selectedTrainer, setSelectedTrainer] = useState(trainee.assignedTrainer || '');

  const trainers = users.filter(u => u.role === 'trainer');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    updateUserById(trainee.id, {
      assignedTrainer: selectedTrainer ? parseInt(selectedTrainer) : null
    });
    
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Assign Trainer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-300">
            Assign a trainer to <span className="text-white font-medium">{trainee.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Trainer
            </label>
            <select
              value={selectedTrainer}
              onChange={(e) => setSelectedTrainer(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
            >
              <option value="">No trainer assigned</option>
              {trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.name} ({trainer.email})
                </option>
              ))}
            </select>
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
              Assign Trainer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}