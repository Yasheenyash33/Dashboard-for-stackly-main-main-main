import React, { useState } from 'react';
import { Plus, Calendar, Clock, Users, ExternalLink, Trash2, CreditCard as Edit, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format, isValid } from 'date-fns';
import { CreateSessionModal } from './CreateSessionModal';
import { AddTraineeModal } from './AddTraineeModal';
import { AttendanceModal } from './AttendanceModal';
import toast from 'react-hot-toast';

export function SessionManagement() {
  const { user, sessions, users, deleteSession, updateSession } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTraineeModal, setShowTraineeModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  let userSessions = [];
  if (user.role === 'admin') {
    userSessions = sessions;
  } else if (user.role === 'trainer') {
    userSessions = sessions.filter(s => s.trainer_id === user.id);
  } else {
    userSessions = sessions.filter(s => s.trainee_id === user.id);
  }

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      const success = await deleteSession(sessionId);
      if (success) {
        toast.success('Session deleted successfully');
      } else {
        toast.error('Failed to delete session');
      }
    }
  };

  const handleJoinSession = (session) => {
    if (session.class_link) {
      window.open(session.class_link, '_blank');
      toast.success('Joining session...');
    } else {
      toast.error('Class link not available');
    }
  };

  const handleAddTrainees = (session) => {
    setSelectedSession(session);
    setShowTraineeModal(true);
  };

  const handleMarkAttendance = (session) => {
    setSelectedSession(session);
    setShowAttendanceModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-600';
      case 'in-progress':
        return 'bg-green-600';
      case 'completed':
        return 'bg-gray-600';
      case 'cancelled':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {user.role === 'trainee' ? 'My Sessions' : 'Session Management'}
          </h1>
          <p className="mt-2 text-gray-400">
            {user.role === 'trainee' 
              ? 'View your assigned sessions and join classes'
              : 'Create, manage, and track training sessions'
            }
          </p>
        </div>
        
        {(user.role === 'admin' || user.role === 'trainer') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Create Session</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {userSessions.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No sessions found</h3>
            <p className="text-gray-400">
              {user.role === 'trainee' 
                ? "You haven't been assigned to any sessions yet."
                : "Get started by creating your first training session."
              }
            </p>
          </div>
        ) : (
          userSessions.map((session) => {
            const trainer = users.find(u => u.id === session.trainer_id);
            const enrolledTrainee = users.find(u => u.id === session.trainee_id);
            const enrolledTrainees = enrolledTrainee ? [enrolledTrainee] : [];
            
            return (
              <div key={session.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-white">{session.title}</h3>
                      <span className={`${getStatusColor(session.status)} text-white text-xs px-2 py-1 rounded-full capitalize`}>
                        {session.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 mb-4">{session.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">
                          {isValid(new Date(session.scheduled_date)) ? format(new Date(session.scheduled_date), 'MMM d, yyyy') : 'Invalid date'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">
                          {isValid(new Date(session.scheduled_date)) ? format(new Date(session.scheduled_date), 'h:mm a') : 'Invalid time'} ({session.duration_minutes} min)
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">
                          {enrolledTrainees.length} trainee{enrolledTrainees.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {user.role !== 'trainee' && trainer && (
                      <p className="text-gray-400 text-sm mb-4">
                        Trainer: {trainer.name}
                      </p>
                    )}

                    {enrolledTrainees.length > 0 && user.role !== 'trainee' && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-white mb-2">Enrolled Trainees:</h4>
                        <div className="flex flex-wrap gap-2">
                          {enrolledTrainees.map((trainee) => (
                            <span
                              key={trainee.id}
                              className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded"
                            >
                              {trainee.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-6">
                    {session.status === 'scheduled' && session.class_link && user.role === 'trainee' && (
                      <button
                        onClick={() => handleJoinSession(session)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Join</span>
                      </button>
                    )}
                    
                    {(user.role === 'admin' || (user.role === 'trainer' && session.trainer === user.id)) && (
                      <>
                        {session.status === 'scheduled' && (
                          <button
                            onClick={() => handleAddTrainees(session)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                          >
                            <UserPlus className="h-4 w-4" />
                            <span>Add Trainees</span>
                          </button>
                        )}
                        
                        {session.status === 'completed' && (
                          <button
                            onClick={() => handleMarkAttendance(session)}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                          >
                            <Users className="h-4 w-4" />
                            <span>Attendance</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showCreateModal && (
        <CreateSessionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            toast.success('Session created successfully');
          }}
        />
      )}

      {showTraineeModal && selectedSession && (
        <AddTraineeModal
          session={selectedSession}
          onClose={() => {
            setShowTraineeModal(false);
            setSelectedSession(null);
          }}
          onSuccess={() => {
            setShowTraineeModal(false);
            setSelectedSession(null);
            toast.success('Trainees added successfully');
          }}
        />
      )}

      {showAttendanceModal && selectedSession && (
        <AttendanceModal
          session={selectedSession}
          onClose={() => {
            setShowAttendanceModal(false);
            setSelectedSession(null);
          }}
          onSuccess={() => {
            setShowAttendanceModal(false);
            setSelectedSession(null);
            toast.success('Attendance marked successfully');
          }}
        />
      )}
    </div>
  );
}