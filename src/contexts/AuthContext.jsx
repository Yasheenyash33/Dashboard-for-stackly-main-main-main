import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext({});

const API_BASE_URL = 'http://localhost:8002';
const WS_BASE_URL = 'ws://localhost:8002';

// Update WebSocket connection
const connectWebSocket = () => {
  const ws = new WebSocket(`${WS_BASE_URL}/ws`);
  
  ws.onopen = () => {
    console.log('WebSocket Connected');
  };

  ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
    // Attempt to reconnect after 5 seconds
    setTimeout(connectWebSocket, 5000);
  };

  ws.onclose = () => {
    console.log('WebSocket Disconnected');
    // Attempt to reconnect after 5 seconds
    setTimeout(connectWebSocket, 5000);
  };

  return ws;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [ws, setWs] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Helper to attach auth header
  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }), [token]);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setUsers([]);
    setSessions([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (ws) {
      ws.close();
      setWs(null);
    }
  }, []);
  // Fetch initial data from backend
  const fetchInitialData = useCallback(async () => {
    if (!token || !user) return;
    console.log('fetchInitialData called');
    setIsDataLoading(true);
    try {
      const fetches = [
      fetch(`${API_BASE_URL}/sessions/`, { headers: authHeaders(), credentials: 'include' }),
      fetch(`${API_BASE_URL}/assignments/`, { headers: authHeaders(), credentials: 'include' }),
      ];
      let usersPromise = null;
      if (user.role === 'admin' || user.role === 'trainer') {
        usersPromise = fetch(`${API_BASE_URL}/users/`, { headers: authHeaders(), credentials: 'include' });
        fetches.push(usersPromise);
      }
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });
      const responses = await Promise.race([Promise.all(fetches), timeoutPromise]);
      const sessionsRes = responses[0];
      const assignmentsRes = responses[1];
      const usersRes = responses.length > 2 ? responses[2] : null;

      if (!sessionsRes.ok) {
        if (sessionsRes.status === 401) {
          console.warn('Unauthorized to fetch sessions, logging out');
          logout();
          return;
        }
        throw new Error('Failed to fetch sessions');
      }
      const sessionsData = await sessionsRes.json();
      setSessions(sessionsData);

      if (!assignmentsRes.ok) {
        setAssignments([]);
      } else {
        const assignmentsData = await assignmentsRes.json();
        setAssignments(assignmentsData);
      }

      if (usersRes) {
        if (!usersRes.ok) {
          if (usersRes.status === 401) {
            console.warn('Unauthorized to fetch users, logging out');
            logout();
            return;
          }
          if (usersRes.status === 403) {
            console.warn('Not authorized to fetch users');
            setUsers([]);
          } else {
            throw new Error('Failed to fetch users');
          }
        } else {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }
      }
      console.log('fetchInitialData completed successfully');
    } catch (error) {
      console.error('Error fetching initial data:', error);
      // Set empty data on error
      setSessions([]);
      setAssignments([]);
      if (user.role === 'admin' || user.role === 'trainer') {
        setUsers([]);
      }
    } finally {
      setIsDataLoading(false);
    }
  }, [token, user, authHeaders, logout]);
  
  // WebSocket message handler
  const handleWsMessage = useCallback((event) => {
    try {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'user_created':
          setUsers(prev => [...prev, message.data.user]);
          break;
        case 'user_updated':
          setUsers(prev => prev.map(u => u.id === message.data.user_id ? message.data.user : u));
          if (user && user.id === message.data.user_id) {
            setUser(message.data.user);
          }
          break;
        case 'user_deleted':
          setUsers(prev => prev.filter(u => u.id !== message.data.user_id));
          if (user && user.id === message.data.user_id) {
            logout();
          }
          break;
        case 'session_created':
          setSessions(prev => [...prev, message.data]);
          break;
        case 'session_updated':
          setSessions(prev => prev.map(s => s.id === message.data.session_id ? { ...s, status: message.data.status, updated_at: message.data.updated_at } : s));
          break;
        case 'session_deleted':
          setSessions(prev => prev.filter(s => s.id !== message.data.session_id));
          break;
        case 'student_assigned':
        case 'student_unassigned':
          // Fetch updated assignments
          fetch(`${API_BASE_URL}/assignments/`, { headers: authHeaders(), credentials: 'include' })
            .then(res => res.json())
            .then(data => setAssignments(data))
            .catch(err => console.error('Error fetching assignments:', err));
          break;
        default:
          console.warn('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }, [user, logout, authHeaders]);

  // Setup WebSocket connection with reconnection
  useEffect(() => {
    if (!token) return;

    let socket;
    let reconnectTimeout;

    const connect = () => {
      socket = new WebSocket(`${WS_BASE_URL}/ws?token=${token}`);
      socket.onopen = () => {
        console.log('WebSocket connected');
        setWs(socket);
      };
      socket.onmessage = handleWsMessage;
      socket.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        setWs(null);
        if (!event.wasClean && token) {
          // Reconnect after 5 seconds
          reconnectTimeout = setTimeout(connect, 5000);
        }
      };
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.close();
      };
    };

    connect();

    return () => {
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [token, handleWsMessage]);

  // Fetch initial data on token change
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Loaded from localStorage, user:', parsedUser, 'role:', parsedUser.role);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (e) {
        console.error('Failed to parse stored user/token:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.detail || 'Login failed' };
      }
      const data = await res.json();
      console.log('Login successful, user:', data.user, 'role:', data.user.role);
      setUser(data.user);
      setToken(data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.access_token);
      return { success: true, forcePasswordChange: data.force_password_change };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login error' };
    }
  };



  // Helper to check backend connectivity and token presence
  const checkBackendAndToken = async () => {
    if (!token) {
      const msg = 'No authentication token found. Please login as admin.';
      console.error(msg);
      if (window.toast) {
        window.toast.error(msg);
      } else {
        alert(msg);
      }
      return false;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: authHeaders(),
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json();
        const msg = errorData.detail || 'Backend health check failed';
        console.error(msg);
        if (window.toast) {
          window.toast.error(msg);
        } else {
          alert(msg);
        }
        return false;
      }
      return true;
    } catch (error) {
      const msg = 'Failed to connect to backend. Please ensure the backend server is running.';
      console.error(msg, error);
      if (window.toast) {
        window.toast.error(msg);
      } else {
        alert(msg);
      }
      return false;
    }
  };

  // Create user via API
  const createUser = async (userData) => {
    console.log('Creating user, current user role:', user ? user.role : 'no user', 'token:', token ? 'present' : 'missing');
    const canProceed = await checkBackendAndToken();
    if (!canProceed) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        let errorMessage = 'Failed to create user';
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        }
        throw new Error(errorMessage);
      }
      const responseData = await res.json();
      // Update users state immediately for immediate UI update
      setUsers(prev => [...prev, responseData.user]);
      return responseData;
    } catch (error) {
      console.error('Create user error:', error.message || error);
      // Show user-friendly error message
      if (error.message.includes('Only admins can create users')) {
        // Use toast if available, else alert
        if (window.toast) {
          window.toast.error('Only administrators can create users. Please contact an admin.');
        } else {
          alert('Only administrators can create users. Please contact an admin.');
        }
      } else {
        if (window.toast) {
          window.toast.error(error.message || 'Failed to create user');
        } else {
          alert(error.message || 'Failed to create user');
        }
      }
      return null;
    }
  };

  // Update user via API
  const updateUserById = async (id, updates) => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to update user');
      }
      const updatedUser = await res.json();
      // WebSocket will update state
      return updatedUser;
    } catch (error) {
      console.error('Update user error:', error);
      return null;
    }
  };

  // Delete user via API
  const deleteUser = async (id) => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to delete user');
      }
      // WebSocket will update state
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  };

  // Create session via API
  const createSession = async (sessionData) => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify(sessionData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to create session');
      }
      const newSession = await res.json();
      // WebSocket will update state
      return newSession;
    } catch (error) {
      console.error('Create session error:', error);
      return null;
    }
  };

  // Update session via API
  const updateSession = async (id, updates) => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to update session');
      }
      const updatedSession = await res.json();
      // WebSocket will update state
      return updatedSession;
    } catch (error) {
      console.error('Update session error:', error);
      return null;
    }
  };

  // Delete session via API
  const deleteSession = async (id) => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.detail && errorData.detail.includes('Only admins can delete sessions')) {
          if (window.toast) {
            window.toast.error('Only administrators can delete sessions. Please contact an admin.');
          } else {
            alert('Only administrators can delete sessions. Please contact an admin.');
          }
        }
        throw new Error(errorData.detail || 'Failed to delete session');
      }
      // WebSocket will update state
      return true;
    } catch (error) {
      console.error('Delete session error:', error);
      return false;
    }
  };

  // Assign student to teacher
  const assignStudent = async (studentId, teacherId) => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/assignments/`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ student_id: studentId, teacher_id: teacherId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to assign student');
      }
      const assignment = await res.json();
      // WebSocket will update state
      return assignment;
    } catch (error) {
      console.error('Assign student error:', error);
      return null;
    }
  };

  // Unassign student from teacher
  const unassignStudent = async (studentId, teacherId) => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/assignments/`, {
        method: 'DELETE',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ student_id: studentId, teacher_id: teacherId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to unassign student');
      }
      // WebSocket will update state
      return true;
    } catch (error) {
      console.error('Unassign student error:', error);
      return false;
    }
  };

  // Provide context value
  const value = {
    user,
    users,
    sessions,
    assignments,
    notifications,
    loading,
    isDataLoading,
    token,
    login,
    logout,
    createUser,
    updateUserById,
    deleteUser,
    createSession,
    updateSession,
    deleteSession,
    assignStudent,
    unassignStudent,
    fetchInitialData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const fetchData = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};
