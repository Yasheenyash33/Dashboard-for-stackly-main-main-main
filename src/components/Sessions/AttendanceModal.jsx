import React, { useState } from 'react';
import { X, Check, X as XIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

export function AttendanceModal({ session, onClose, onSuccess }) {
  const { users, updateSession } = useAuth();
  const [attendance, setAttendance] = useState(session.attendance || {});

  const enrolledTrainees = users.filter(u => session.trainees.includes(u.id));

  const handleAttendanceChange = (traineeId, present) => {
    setAttendance(prev => ({
      ...prev,
      [traineeId]: {
        present,
        joinedAt: present ? new Date() : null
      }
    }));
  };

  const handleSubmit = () => {
    updateSession(session.id, { attendance });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Mark Attendance</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-2">{session.title}</h3>
          <p className="text-gray-400 text-sm">
            {format(new Date(session.startTime), 'MMM d, yyyy • h:mm a')}
          </p>
        </div>

        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {enrolledTrainees.map((trainee) => {
            const traineeAttendance = attendance[trainee.id];
            const isPresent = traineeAttendance?.present;
            
            return (
              <div
                key={trainee.id}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{trainee.name}</p>
                  <p className="text-gray-400 text-sm">{trainee.email}</p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAttendanceChange(trainee.id, true)}
                    className={`
                      px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200
                      ${isPresent 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-green-600 hover:text-white'
                      }
                    `}
                  >
                    <Check className="h-4 w-4" />
                    <span className="text-sm">Present</span>
                  </button>
                  
                  <button
                    onClick={() => handleAttendanceChange(trainee.id, false)}
                    className={`
                      px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200
                      ${isPresent === false 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-red-600 hover:text-white'
                      }
                    `}
                  >
                    <XIcon className="h-4 w-4" />
                    <span className="text-sm">Absent</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Save Attendance
          </button>
        </div>
      </div>
    </div>
  );
}