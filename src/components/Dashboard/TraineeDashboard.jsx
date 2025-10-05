import React from 'react';
import { BookOpen, Clock, Award, TrendingUp, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function TraineeDashboard() {
  const { user, sessions, users } = useAuth();
  
  const mySessions = sessions.filter(s => s.trainees.includes(user.id));
  const upcomingSessions = mySessions.filter(s => s.status === 'scheduled');
  const completedSessions = mySessions.filter(s => s.status === 'completed');
  const myTrainer = users.find(u => u.id === user.assignedTrainer);

  const stats = [
    {
      name: 'Total Sessions',
      value: mySessions.length,
      icon: BookOpen,
      color: 'bg-green-600',
    },
    {
      name: 'Upcoming',
      value: upcomingSessions.length,
      icon: Clock,
      color: 'bg-blue-600',
    },
    {
      name: 'Completed',
      value: completedSessions.length,
      icon: Award,
      color: 'bg-amber-600',
    },
    {
      name: 'Progress',
      value: `${mySessions.length ? Math.round((completedSessions.length / mySessions.length) * 100) : 0}%`,
      icon: TrendingUp,
      color: 'bg-purple-600',
    }
  ];

  const handleJoinSession = (session) => {
    if (session.classLink) {
      window.open(session.classLink, '_blank');
      toast.success('Joining session...');
    } else {
      toast.error('Class link not available');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">My Learning Dashboard</h1>
        <p className="mt-2 text-gray-400">Track your progress and upcoming sessions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.name}</p>
                <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} rounded-full p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Upcoming Sessions</h3>
          <div className="space-y-4">
            {upcomingSessions.length === 0 ? (
              <p className="text-gray-400 text-sm">No upcoming sessions</p>
            ) : (
              upcomingSessions.map((session) => {
                const trainer = users.find(u => u.id === session.trainer);
                return (
                  <div key={session.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{session.title}</h4>
                        <p className="text-gray-300 text-sm mt-1">{session.description}</p>
                        <div className="flex items-center space-x-4 mt-3">
                          <p className="text-gray-400 text-sm">
                            {format(new Date(session.startTime), 'MMM d, h:mm a')}
                          </p>
                          <p className="text-gray-400 text-sm">
                            by {trainer?.name}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinSession(session)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors duration-200"
                      >
                        <span>Join</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Learning Progress</h3>
          <div className="space-y-6">
            {/* Overall Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm font-medium">Overall Completion</span>
                <span className="text-green-400 text-sm font-medium">
                  {mySessions.length ? Math.round((completedSessions.length / mySessions.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${mySessions.length ? (completedSessions.length / mySessions.length) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* My Trainer */}
            {myTrainer && (
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">My Trainer</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {myTrainer.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{myTrainer.name}</p>
                    <p className="text-gray-400 text-sm">{myTrainer.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{completedSessions.length}</p>
                <p className="text-gray-400 text-sm">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{upcomingSessions.length}</p>
                <p className="text-gray-400 text-sm">Upcoming</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Completed Sessions */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recently Completed</h3>
        <div className="space-y-4">
          {completedSessions.slice(0, 5).map((session) => {
            const trainer = users.find(u => u.id === session.trainer);
            const attendance = session.attendance[user.id];
            
            return (
              <div key={session.id} className="flex items-center justify-between bg-gray-700 border border-gray-600 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <h4 className="font-medium text-white">{session.title}</h4>
                    <p className="text-gray-400 text-sm">
                      {format(new Date(session.startTime), 'MMM d, yyyy')} • by {trainer?.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {attendance?.present ? (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                      Attended
                    </span>
                  ) : (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                      Absent
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          
          {completedSessions.length === 0 && (
            <p className="text-gray-400 text-sm">No completed sessions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}