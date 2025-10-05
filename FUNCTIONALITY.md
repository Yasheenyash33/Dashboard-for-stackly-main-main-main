# Training Management System - Complete Functionality Documentation

## Overview

The Training Management System is a full-stack web application built with FastAPI (backend), React (frontend), and MySQL (database). It provides role-based user management, session scheduling, real-time updates via WebSockets, analytics, and reporting capabilities.

## Architecture

- **Backend**: FastAPI with SQLAlchemy ORM, JWT authentication, WebSocket support
- **Frontend**: React with Context API for state management, real-time WebSocket integration
- **Database**: MySQL with automatic schema creation
- **Real-time**: WebSocket connections for live data synchronization

---

## 1. Backend API Endpoints

### Authentication Endpoints

#### `POST /auth/login`
**Purpose**: Authenticate user and return JWT token
**Input**: `LoginRequest` (username, password)
**Output**: `TokenResponse` (access_token, user data, force_password_change flag)
**Real-time**: None
**Authorization**: Public

#### `POST /auth/change-password`
**Purpose**: Change user password (requires current password for non-admins)
**Input**: `ChangePasswordRequest` (current_password, new_password)
**Output**: Success message
**Real-time**: Broadcasts `password_changed` event
**Authorization**: Authenticated user

#### `POST /auth/reset-password/{user_id}`
**Purpose**: Admin resets user password to temporary
**Input**: `ResetPasswordRequest` (new_password)
**Output**: Success message
**Real-time**: Broadcasts `password_reset` event
**Authorization**: Admin only

#### `POST /auth/admin-change-password`
**Purpose**: Admin changes own password without current password
**Input**: `ChangePasswordRequest` (new_password)
**Output**: Success message
**Real-time**: Broadcasts `password_changed` event
**Authorization**: Admin only

### User Management Endpoints

#### `GET /users/`
**Purpose**: List all users (filtered by role permissions)
**Input**: Query params (skip, limit)
**Output**: List of `User` objects
**Real-time**: None
**Authorization**: Admin/Trainer

#### `GET /users/{user_id}`
**Purpose**: Get specific user details
**Input**: user_id path parameter
**Output**: `User` object
**Real-time**: None
**Authorization**: Admin/Trainer or self

#### `POST /users/`
**Purpose**: Create new user
**Input**: `UserCreate` (username, email, password, role, etc.)
**Output**: Created `User` object
**Real-time**: Broadcasts `user_created` and `credentials_shared` events
**Authorization**: Admin only

#### `PUT /users/{user_id}`
**Purpose**: Update user information
**Input**: user_id path, `UserUpdate` data
**Output**: Updated `User` object
**Real-time**: Broadcasts `user_updated` event
**Authorization**: Admin or self

#### `DELETE /users/{user_id}`
**Purpose**: Delete user
**Input**: user_id path parameter
**Output**: Success message
**Real-time**: Broadcasts `user_deleted` event
**Authorization**: Admin only

### Session Management Endpoints

#### `GET /sessions/`
**Purpose**: List all sessions
**Input**: Query params (skip, limit)
**Output**: List of `Session` objects
**Real-time**: None
**Authorization**: Authenticated users

#### `GET /sessions/{session_id}`
**Purpose**: Get specific session details
**Input**: session_id path parameter
**Output**: `Session` object
**Real-time**: None
**Authorization**: Authenticated users

#### `POST /sessions/`
**Purpose**: Create new training session
**Input**: `SessionCreate` data
**Output**: Created `Session` object
**Real-time**: Broadcasts `session_created` event
**Authorization**: Admin/Trainer

#### `PUT /sessions/{session_id}`
**Purpose**: Update session information
**Input**: session_id path, `SessionUpdate` data
**Output**: Updated `Session` object
**Real-time**: Broadcasts `session_updated` event
**Authorization**: Admin/Trainer

#### `DELETE /sessions/{session_id}`
**Purpose**: Delete session
**Input**: session_id path parameter
**Output**: Success message
**Real-time**: Broadcasts `session_deleted` event
**Authorization**: Admin only

### Assignment Endpoints

#### `GET /assignments/`
**Purpose**: List all student-teacher assignments
**Input**: Query params (skip, limit)
**Output**: List of `AssignedStudentWithDetails` objects
**Real-time**: None
**Authorization**: Admin/Trainer

#### `POST /assignments/`
**Purpose**: Assign student to teacher
**Input**: `AssignedStudentCreate` (student_id, teacher_id)
**Output**: Created `AssignedStudent` object
**Real-time**: Broadcasts `student_assigned` event
**Authorization**: Admin only

#### `DELETE /assignments/{student_id}/{teacher_id}`
**Purpose**: Unassign student from teacher
**Input**: student_id, teacher_id path parameters
**Output**: Success message
**Real-time**: Broadcasts `student_unassigned` event
**Authorization**: Admin only

### Analytics Endpoints

#### `GET /analytics/users`
**Purpose**: Get user count by role
**Input**: None
**Output**: Dictionary with role counts
**Real-time**: None
**Authorization**: Admin only

#### `GET /analytics/sessions`
**Purpose**: Get session count by status
**Input**: None
**Output**: Dictionary with status counts
**Real-time**: None
**Authorization**: Admin only

### Report Generation Endpoints

#### `GET /reports/generate`
**Purpose**: Generate and download reports
**Input**: Query param `format` (pdf/csv/excel)
**Output**: File download stream
**Real-time**: None
**Authorization**: Admin only

### WebSocket Endpoint

#### `WebSocket /ws`
**Purpose**: Real-time bidirectional communication
**Input**: WebSocket connection
**Output**: JSON messages for broadcasts
**Real-time**: Core real-time functionality
**Authorization**: Authenticated users

---

## 2. Database Models

### User Model
**Fields**:
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email
- `password_hash`: Hashed password
- `role`: Enum (admin/trainer/trainee)
- `first_name`, `last_name`: Name fields
- `is_temporary_password`: Boolean flag
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Sessions as trainer (one-to-many)
- Sessions as trainee (one-to-many)

**Hybrid Property**: `name` (first_name + last_name)

### Session Model
**Fields**:
- `id`: Primary key
- `title`: Session title
- `description`: Optional description
- `trainer_id`, `trainee_id`: Foreign keys to User
- `scheduled_date`: DateTime
- `duration_minutes`: Integer
- `status`: Enum (scheduled/completed/cancelled)
- `class_link`: Optional URL
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Trainer (many-to-one)
- Trainee (many-to-one)

### AssignedStudent Model
**Fields**:
- `id`: Primary key
- `student_id`, `teacher_id`: Foreign keys to User
- `assigned_date`: DateTime

**Relationships**:
- Student (many-to-one)
- Teacher (many-to-one)

### PasswordChangeLog Model
**Fields**:
- `id`: Primary key
- `user_id`: Foreign key to User
- `action`: String (created/changed/reset)
- `performed_by`: Optional foreign key to User
- `timestamp`: DateTime
- `details`: Optional string

**Relationships**:
- User (many-to-one)
- Performer (many-to-one)

---

## 3. CRUD Operations

### User CRUD Functions

#### `get_user(db, user_id)`
**Purpose**: Retrieve user by ID
**Input**: Database session, user_id
**Output**: User object or None

#### `get_user_by_username(db, username)`
**Purpose**: Retrieve user by username
**Input**: Database session, username
**Output**: User object or None

#### `get_user_by_email(db, email)`
**Purpose**: Retrieve user by email
**Input**: Database session, email
**Output**: User object or None

#### `get_users(db, skip, limit)`
**Purpose**: Retrieve paginated list of users
**Input**: Database session, skip, limit
**Output**: List of User objects

#### `create_user(db, user)`
**Purpose**: Create new user with hashed password
**Input**: Database session, UserCreate schema
**Output**: Created User object

#### `update_user(db, user_id, user_update)`
**Purpose**: Update user information
**Input**: Database session, user_id, UserUpdate schema
**Output**: Updated User object or None

#### `delete_user(db, user_id)`
**Purpose**: Delete user by ID
**Input**: Database session, user_id
**Output**: Boolean success

#### `authenticate_user(db, username, password)`
**Purpose**: Verify user credentials
**Input**: Database session, username, password
**Output**: User object or False

#### `change_password(db, user_id, new_password, performed_by)`
**Purpose**: Update user password and log change
**Input**: Database session, user_id, new_password, performed_by
**Output**: Updated User object or None

#### `reset_password(db, user_id, new_password, performed_by)`
**Purpose**: Reset user password to temporary and log
**Input**: Database session, user_id, new_password, performed_by
**Output**: Updated User object or None

### Session CRUD Functions

#### `get_session(db, session_id)`
**Purpose**: Retrieve session by ID
**Input**: Database session, session_id
**Output**: Session object or None

#### `get_sessions(db, skip, limit)`
**Purpose**: Retrieve paginated list of sessions
**Input**: Database session, skip, limit
**Output**: List of Session objects

#### `create_session(db, session)`
**Purpose**: Create new session
**Input**: Database session, SessionCreate schema
**Output**: Created Session object

#### `update_session(db, session_id, session_update)`
**Purpose**: Update session information
**Input**: Database session, session_id, SessionUpdate schema
**Output**: Updated Session object or None

#### `delete_session(db, session_id)`
**Purpose**: Delete session by ID
**Input**: Database session, session_id
**Output**: Boolean success

### Assignment CRUD Functions

#### `get_assigned_students(db, skip, limit)`
**Purpose**: Retrieve paginated assignments
**Input**: Database session, skip, limit
**Output**: List of AssignedStudent objects

#### `assign_student_to_teacher(db, student_id, teacher_id)`
**Purpose**: Create student-teacher assignment
**Input**: Database session, student_id, teacher_id
**Output**: Created AssignedStudent object

#### `unassign_student_from_teacher(db, student_id, teacher_id)`
**Purpose**: Remove student-teacher assignment
**Input**: Database session, student_id, teacher_id
**Output**: Boolean success

### Analytics Functions

#### `get_user_count_by_role(db)`
**Purpose**: Count users grouped by role
**Input**: Database session
**Output**: Dictionary of role: count

#### `get_session_count_by_status(db)`
**Purpose**: Count sessions grouped by status
**Input**: Database session
**Output**: Dictionary of status: count

---

## 4. Frontend Components

### Authentication Components

#### `Login.jsx`
**Purpose**: User login form
**Functionality**: Handles username/password input, API call, token storage, redirects on success
**Real-time**: None
**Props**: None

#### `ChangePassword.jsx`
**Purpose**: Password change form for temporary passwords
**Functionality**: Validates new password, API call, updates user state
**Real-time**: None
**Props**: None

#### `ProtectedRoute.jsx`
**Purpose**: Route guard for role-based access
**Functionality**: Checks user authentication and role permissions
**Real-time**: None
**Props**: roles (optional array)

### Dashboard Components

#### `AdminDashboard.jsx`
**Purpose**: Admin overview with stats and quick actions
**Functionality**: Displays user/session stats, charts, create user/session modals
**Real-time**: Updates via AuthContext WebSocket
**Props**: None

#### `TrainerDashboard.jsx`
**Purpose**: Trainer view of assigned sessions
**Functionality**: Shows trainer's sessions and trainees
**Real-time**: Updates via AuthContext WebSocket
**Props**: None

#### `TraineeDashboard.jsx`
**Purpose**: Trainee view of assigned sessions
**Functionality**: Shows trainee's upcoming sessions
**Real-time**: Updates via AuthContext WebSocket
**Props**: None

### User Management Components

#### `UserManagement.jsx`
**Purpose**: User CRUD interface
**Functionality**: Lists users, create/delete users, assign trainers
**Real-time**: Updates via AuthContext WebSocket
**Props**: None

#### `CreateUserModal.jsx`
**Purpose**: User creation form modal
**Functionality**: Form validation, API call, success callback
**Real-time**: Triggers WebSocket broadcasts
**Props**: onClose, onSuccess

#### `AssignTrainerModal.jsx`
**Purpose**: Assign trainer to trainee modal
**Functionality**: Dropdown selection, API call
**Real-time**: Triggers WebSocket broadcasts
**Props**: trainee, onClose, onSuccess

### Session Management Components

#### `SessionManagement.jsx`
**Purpose**: Session CRUD interface
**Functionality**: Lists sessions, create/delete sessions, join sessions, manage attendance
**Real-time**: Updates via AuthContext WebSocket
**Props**: None

#### `CreateSessionModal.jsx`
**Purpose**: Session creation form modal
**Functionality**: Form validation, API call, success callback
**Real-time**: Triggers WebSocket broadcasts
**Props**: onClose, onSuccess

#### `AddTraineeModal.jsx`
**Purpose**: Add trainees to session modal
**Functionality**: Multi-select trainees, API call
**Real-time**: None (session updates trigger broadcasts)
**Props**: session, onClose, onSuccess

#### `AttendanceModal.jsx`
**Purpose**: Mark session attendance modal
**Functionality**: Attendance checkboxes, API call
**Real-time**: None (session updates trigger broadcasts)
**Props**: session, onClose, onSuccess

### Analytics Components

#### `Analytics.jsx`
**Purpose**: Analytics dashboard with charts and reports
**Functionality**: Displays stats, charts, export reports
**Real-time**: Updates via AuthContext WebSocket
**Props**: None

### Layout Components

#### `Layout.jsx`
**Purpose**: Main app layout wrapper
**Functionality**: Sidebar navigation, header, content area
**Real-time**: None
**Props**: children

#### `Navbar.jsx`
**Purpose**: Top navigation bar
**Functionality**: User menu, logout, notifications
**Real-time**: Updates via AuthContext WebSocket
**Props**: None

#### `Sidebar.jsx`
**Purpose**: Navigation sidebar
**Functionality**: Role-based menu items, active state
**Real-time**: None
**Props**: None

---

## 5. Real-Time Data Flow

### WebSocket Connection Manager (Backend)

#### `ConnectionManager` Class
**Purpose**: Manages WebSocket connections and broadcasting
**Methods**:
- `connect(websocket)`: Accept and store connection
- `disconnect(websocket)`: Remove connection
- `broadcast(message)`: Send message to all connected clients

### WebSocket Events

#### User Events
- `user_created`: New user created with full user data
- `user_updated`: User updated with full user data
- `user_deleted`: User deleted with user_id
- `password_changed`: Password changed with user_id and action
- `password_reset`: Password reset with user_id and new password
- `credentials_shared`: New user credentials shared

#### Session Events
- `session_created`: New session created with session data
- `session_updated`: Session updated with session data
- `session_deleted`: Session deleted with session_id

#### Assignment Events
- `student_assigned`: Student assigned to teacher
- `student_unassigned`: Student unassigned from teacher

### Frontend WebSocket Integration

#### AuthContext WebSocket Handling
**Connection**: Establishes WebSocket on authentication
**Reconnection**: Auto-reconnects on disconnection
**Message Handler**: Updates React state based on event types
**State Updates**: Immediately reflects changes in UI without refresh

### Real-Time Data Synchronization

1. **User Actions**: Create/update/delete operations trigger API calls
2. **Backend Processing**: Database changes committed
3. **WebSocket Broadcast**: Event sent to all connected clients
4. **Frontend Reception**: AuthContext receives and processes message
5. **State Update**: React state updated, UI re-renders
6. **Persistence**: All changes persisted in MySQL database

---

## 6. Authentication & Authorization

### JWT Token System

#### Token Creation
**Function**: `create_access_token(data)`
**Input**: User data dictionary
**Output**: Encoded JWT string
**Expiration**: 24 hours (1440 minutes)

#### Token Verification
**Function**: `verify_token(credentials)`
**Input**: HTTP Authorization header
**Output**: Username from token payload
**Validation**: Signature, expiration, payload structure

### Role-Based Access Control

#### User Roles
- **Admin**: Full system access, user/session management, analytics
- **Trainer**: Session creation/management, view users, assigned trainees
- **Trainee**: View own sessions, join classes, limited profile access

#### Route Protection
- **Frontend**: `ProtectedRoute` component checks user role
- **Backend**: Endpoint functions check `current_user.role`

### Password Management

#### Temporary Passwords
- New users created with `is_temporary_password = True`
- Forced password change on first login
- Admin can reset passwords to temporary

#### Password Security
- PBKDF2 hashing with SHA256
- Minimum 6 characters required
- Password change logging with performer tracking

### Session Management

#### Authentication Flow
1. User submits login form
2. Backend validates credentials
3. JWT token generated and returned
4. Frontend stores token in localStorage
5. Subsequent requests include Bearer token
6. Token verified on each protected request

#### Logout Process
1. Clear localStorage
2. Reset React state
3. Close WebSocket connection
4. Redirect to login

---

## 7. Data Flow & Integration

### Frontend-Backend Integration

#### API Calls
- All API calls use `fetch` with Authorization headers
- Credentials included for CORS
- Error handling with user-friendly messages
- Toast notifications for success/error states

#### State Management
- **AuthContext**: Centralized state for user, users, sessions, assignments
- **Real-time Updates**: WebSocket messages update context state
- **Local Storage**: Persist authentication across sessions

### Database Integration

#### Connection Setup
- SQLAlchemy engine with connection pooling
- Automatic database creation if not exists
- Environment variable configuration
- Connection health monitoring

#### Schema Management
- Automatic table creation on startup
- Migration support via SQL files
- Foreign key relationships enforced
- Index optimization for performance

### Real-Time Architecture

#### Bidirectional Communication
- **Client → Server**: Authentication, data requests
- **Server → Client**: Real-time updates, broadcasts
- **Connection Persistence**: Maintains state across page refreshes
- **Auto-reconnection**: Handles network interruptions

#### Event-Driven Updates
- **Database Triggers**: Changes trigger broadcasts
- **State Synchronization**: All clients stay in sync
- **Optimistic Updates**: Immediate UI feedback
- **Conflict Resolution**: Server state takes precedence

---

## 8. Error Handling & Validation

### Backend Validation
- **Pydantic Schemas**: Input validation and serialization
- **HTTP Exceptions**: Structured error responses
- **Database Constraints**: Foreign key and unique constraints
- **Logging**: Error tracking and debugging

### Frontend Error Handling
- **API Response Checks**: Status code validation
- **User Feedback**: Toast notifications
- **Form Validation**: Client-side input validation
- **Graceful Degradation**: Fallback UI states

### WebSocket Error Handling
- **Connection Failures**: Auto-reconnection logic
- **Message Parsing**: JSON validation
- **Broadcast Failures**: Individual client isolation
- **Timeout Handling**: Connection cleanup

---

## 9. Performance & Scalability

### Database Optimization
- **Indexing**: Primary keys, foreign keys, unique constraints
- **Connection Pooling**: SQLAlchemy engine configuration
- **Query Optimization**: Efficient joins and filtering
- **Pagination**: Limit result sets

### Real-Time Performance
- **Connection Limits**: Manage concurrent WebSocket connections
- **Broadcast Efficiency**: Send only necessary data
- **State Updates**: Targeted React re-renders
- **Memory Management**: Clean up disconnected clients

### Frontend Optimization
- **Component Memoization**: Prevent unnecessary re-renders
- **Lazy Loading**: Code splitting for large components
- **State Management**: Efficient context updates
- **Caching**: Local storage for authentication

---

## 10. Security Considerations

### Authentication Security
- **JWT Tokens**: Secure token generation and validation
- **Password Hashing**: Strong cryptographic hashing
- **Session Expiration**: Token timeout enforcement
- **Secure Headers**: CORS configuration

### Data Protection
- **Input Sanitization**: Pydantic validation
- **SQL Injection Prevention**: SQLAlchemy parameterization
- **XSS Protection**: React's built-in escaping
- **CSRF Protection**: CORS and token validation

### Access Control
- **Role-Based Permissions**: Granular access control
- **API Authorization**: Endpoint-level checks
- **Data Filtering**: User-specific data access
- **Audit Logging**: Password change tracking

---

This documentation provides a comprehensive overview of all functions, their purposes, inputs/outputs, and real-time connectivity aspects of the Training Management System. Each component is designed to work seamlessly together to provide a robust, scalable, and user-friendly training management platform.
