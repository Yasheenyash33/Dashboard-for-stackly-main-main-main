import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function AddTraineeModal({ session, onClose, onSuccess }) {
  const { users, updateSession } = useAuth();
  const [selectedTrainees, setSelectedTrainees] = useState([]);

  const availableTrainees = users.filter(u => 
    u.role === 'trainee' && !session.trainees.includes(u.id)
  );

  const handleTraineeToggle = (traineeId) => {
    setSelectedTrainees(prev => 
      prev.includes(traineeId) 
        ? prev.filter(id => id !== traineeId)
        : [...prev, traineeId]
    );
  };

  const handleSubmit = () => {
    if (selectedTrainees.length > 0) {
      const updatedTrainees = [...session.trainees, ...selectedTrainees];
      updateSession(session.id, { trainees: updatedTrainees });
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Add Trainees to Session</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium text-white mb-2">{session.title}</h3>
          <p className="text-gray-400 text-sm">{session.description}</p>
        </div>

        {availableTrainees.length === 0 ? (
          <p className="text-gray-400 text-center py-4">
            No available trainees to add
          </p>
        ) : (
          <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
            {availableTrainees.map((trainee) => (
              <label
                key={trainee.id}
                className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-200"
              >
                <input
                  type="checkbox"
                  checked={selectedTrainees.includes(trainee.id)}
                  onChange={() => handleTraineeToggle(trainee.id)}
                  className="w-4 h-4 text-green-600 bg-gray-600 border-gray-500 rounded focus:ring-green-500"
                />
                <div className="flex-1">
                  <p className="text-white font-medium">{trainee.name}</p>
                  <p className="text-gray-400 text-sm">{trainee.email}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedTrainees.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Add {selectedTrainees.length} Trainee{selectedTrainees.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}