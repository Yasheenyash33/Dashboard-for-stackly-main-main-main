import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Users, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function AssignStudents() {
  const { user, users, assignStudent, unassignStudent, assignments } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;

    // Filter students and teachers (assuming department/year are not in model, use all for now)
    const students = users.filter(u => u.role === 'trainee');
    const teachers = users.filter(u => u.role === 'trainer');

    setFilteredStudents(students);
    setFilteredTeachers(teachers);
  }, [users, isAdmin]);

  const handleAssign = async () => {
    if (!selectedStudent || !selectedTeacher) {
      toast.error('Please select both student and teacher');
      return;
    }

    const result = await assignStudent(selectedStudent.id, selectedTeacher.id);
    if (result) {
      toast.success('Student assigned successfully');
      setSelectedStudent(null);
      setSelectedTeacher(null);
    } else {
      toast.error('Failed to assign student');
    }
  };

  const handleUnassign = async (studentId, teacherId) => {
    const result = await unassignStudent(studentId, teacherId);
    if (result) {
      toast.success('Student unassigned successfully');
    } else {
      toast.error('Failed to unassign student');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Users className="h-8 w-8 mr-3" />
            Assign Students to Teachers
          </h1>
          <p className="mt-2 text-gray-400">
            Manage student-teacher assignments
          </p>
        </div>
      </div>

      {/* Assignment Form */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Assign Student</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Student
            </label>
            <select
              value={selectedStudent?.id || ''}
              onChange={(e) => {
                const student = filteredStudents.find(s => s.id === parseInt(e.target.value));
                setSelectedStudent(student);
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
            >
              <option value="">Choose a student</option>
              {filteredStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Teacher
            </label>
            <select
              value={selectedTeacher?.id || ''}
              onChange={(e) => {
                const teacher = filteredTeachers.find(t => t.id === parseInt(e.target.value));
                setSelectedTeacher(teacher);
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
            >
              <option value="">Choose a teacher</option>
              {filteredTeachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.email})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAssign}
              disabled={!selectedStudent || !selectedTeacher}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
            >
              <UserPlus className="h-4 w-4" />
              <span>Assign</span>
            </button>
          </div>
        </div>
      </div>

      {/* Current Assignments */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Current Assignments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Assigned Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <GraduationCap className="h-4 w-4 text-white" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-white">{assignment.student.name}</div>
                        <div className="text-sm text-gray-400">{assignment.student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-white">{assignment.teacher.name}</div>
                        <div className="text-sm text-gray-400">{assignment.teacher.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(assignment.assigned_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleUnassign(assignment.student.id, assignment.teacher.id)}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {assignments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No assignments found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
