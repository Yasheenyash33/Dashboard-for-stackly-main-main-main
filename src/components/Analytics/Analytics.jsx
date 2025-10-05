import React, { useState } from 'react';
import { Calendar, Download, TrendingUp, Users, Award, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

export function Analytics() {
  const { users, sessions } = useAuth();
  const [dateRange, setDateRange] = useState('30');

  const endDate = new Date();
  const startDate = subDays(endDate, parseInt(dateRange));

  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.startTime);
    return sessionDate >= startDate && sessionDate <= endDate;
  });

  const stats = [
    {
      name: 'Total Sessions',
      value: filteredSessions.length,
      icon: Award,
      color: 'bg-green-600',
      change: '+12%'
    },
    {
      name: 'Active Users',
      value: users.filter(u => u.role !== 'admin').length,
      icon: Users,
      color: 'bg-blue-600',
      change: '+5%'
    },
    {
      name: 'Completion Rate',
      value: `${filteredSessions.length ? Math.round((filteredSessions.filter(s => s.status === 'completed').length / filteredSessions.length) * 100) : 0}%`,
      icon: TrendingUp,
      color: 'bg-amber-600',
      change: '+8%'
    },
    {
      name: 'Avg Duration',
      value: `${filteredSessions.length ? Math.round(filteredSessions.reduce((acc, s) => acc + s.duration, 0) / filteredSessions.length) : 0}m`,
      icon: Clock,
      color: 'bg-purple-600',
      change: '+2%'
    }
  ];

  // Session Status Distribution
  const statusData = [
    { name: 'Scheduled', value: filteredSessions.filter(s => s.status === 'scheduled').length },
    { name: 'Completed', value: filteredSessions.filter(s => s.status === 'completed').length },
    { name: 'Cancelled', value: filteredSessions.filter(s => s.status === 'cancelled').length }
  ];

  // Trainer Performance
  const trainers = users.filter(u => u.role === 'trainer');
  const trainerPerformance = trainers.map(trainer => {
    const trainerSessions = filteredSessions.filter(s => s.trainer === trainer.id);
    const completedSessions = trainerSessions.filter(s => s.status === 'completed');
    const totalAttendees = completedSessions.reduce((acc, session) => {
      return acc + Object.values(session.attendance || {}).filter(a => a.present).length;
    }, 0);

    return {
      name: trainer.name,
      sessions: trainerSessions.length,
      completed: completedSessions.length,
      attendees: totalAttendees,
      completionRate: trainerSessions.length ? Math.round((completedSessions.length / trainerSessions.length) * 100) : 0
    };
  });

  // User Engagement Over Time
  const engagementData = [];
  for (let i = parseInt(dateRange) - 1; i >= 0; i--) {
    const date = subDays(endDate, i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    const daySessions = sessions.filter(s => {
      const sessionDate = new Date(s.startTime);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });

    const attendanceCount = daySessions.reduce((acc, session) => {
      return acc + Object.values(session.attendance || {}).filter(a => a.present).length;
    }, 0);

    engagementData.push({
      date: format(date, 'MMM d'),
      sessions: daySessions.length,
      attendance: attendanceCount
    });
  }

  const handleExport = async (format) => {
    try {
      const response = await fetch(`http://localhost:8001/reports/generate?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `training-report-${format(new Date(), 'yyyy-MM-dd')}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      // Handle error, maybe show toast
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-400">Comprehensive insights into training performance</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>

          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('pdf')}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors duration-200 text-sm"
            >
              <Download className="h-4 w-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors duration-200 text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Excel</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors duration-200 text-sm"
            >
              <Download className="h-4 w-4" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.name}</p>
                <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                <p className="text-green-400 text-sm mt-1">{stat.change}</p>
              </div>
              <div className={`${stat.color} rounded-full p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Session Status Distribution */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Session Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* User Engagement Trends */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Engagement Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '0.375rem',
                  color: '#F9FAFB'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Sessions"
              />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Attendance"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trainer Performance Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Trainer Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Trainer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Sessions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total Attendees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Completion Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {trainerPerformance.map((trainer) => (
                <tr key={trainer.name} className="hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                    {trainer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {trainer.sessions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {trainer.completed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {trainer.attendees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${trainer.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-300 min-w-0">
                        {trainer.completionRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {trainerPerformance.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No trainer performance data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h4 className="text-white font-semibold mb-4">Peak Activity Hours</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">9:00 AM - 11:00 AM</span>
              <span className="text-green-400 text-sm font-medium">High</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">2:00 PM - 4:00 PM</span>
              <span className="text-blue-400 text-sm font-medium">Medium</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">6:00 PM - 8:00 PM</span>
              <span className="text-amber-400 text-sm font-medium">Low</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h4 className="text-white font-semibold mb-4">Popular Session Types</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Technical Training</span>
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">65%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Soft Skills</span>
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">25%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Leadership</span>
              <span className="bg-amber-600 text-white text-xs px-2 py-1 rounded">10%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h4 className="text-white font-semibold mb-4">Feedback Scores</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Content Quality</span>
              <div className="flex items-center">
                <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <span className="text-green-400 text-sm">4.6</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Instructor</span>
              <div className="flex items-center">
                <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>
                <span className="text-green-400 text-sm">4.4</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Overall</span>
              <div className="flex items-center">
                <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
                <span className="text-green-400 text-sm">4.5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}