# Training Management System

## 📘 Project Overview

A comprehensive web application for managing training sessions, users, and analytics in an educational or corporate training environment. Built with modern web technologies for scalability and real-time collaboration.

### Description
The Training Management System is designed to streamline the process of organizing and tracking training programs. It provides a centralized platform where administrators can manage users, trainers can schedule sessions, and trainees can participate in training activities. The system supports real-time updates to ensure all users have the latest information.

### Key Features and Functionality
- **User Management**: Role-based access control with Admin, Trainer, and Trainee roles
- **Session Management**: Create, schedule, update, and track training sessions with status monitoring
- **Analytics Dashboard**: View user distribution by roles and session statistics
- **Real-Time Updates**: WebSocket integration for live synchronization of data across clients
- **Report Generation**: Download reports in PDF, CSV, or Excel formats
- **Secure Authentication**: JWT-based authentication with temporary password management

### Technologies Used
#### Frontend
- **React 18** with TypeScript for component-based UI development
- **Vite** for fast development and optimized production builds
- **Tailwind CSS** for responsive styling
- **React Router** for client-side routing
- **React Hot Toast** for user notifications
- **Lucide React** for consistent iconography
- **Recharts** for data visualization in analytics

#### Backend
- **FastAPI** for high-performance REST API development
- **SQLAlchemy** with MySQL for robust database operations
- **JWT (PyJWT)** for secure token-based authentication
- **WebSockets** for real-time bidirectional communication
- **Pydantic** for data validation and serialization
- **ReportLab** and **OpenPyXL** for report generation

#### Database
- **MySQL** for persistent data storage

## 🚀 Installation Instructions

### Prerequisites
- **Node.js** (v16 or higher) - for frontend development
- **Python** (v3.8 or higher) - for backend development
- **MySQL** (v5.7 or higher) - for database
- **Git** - for version control

### Step-by-Step Guide

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd training-management-system
   ```

2. **Backend Setup:**

   a. Navigate to the backend directory:
   ```bash
   cd backend
   ```

   b. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  / On Windows: venv\Scripts\activate
   ```

   c. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

   d. Set up environment variables:
   Create a `.env` file in the backend directory:
   ```env
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=training_app
   SECRET_KEY=your-secret-key-here
   ```

3. **Frontend Setup:**

   a. Navigate to the root directory:
   ```bash
   cd ..
   ```

   b. Install Node.js dependencies:
   ```bash
   npm install
   ```

### Database Setup

1. **Start MySQL service** and ensure it's running on your system.

2. **Create the database:**
   The application will automatically create the database and tables when you run the backend for the first time.

3. **Load sample data (optional):**
   ```bash
   cd backend
   python -m backend.sample_data
   # On Windows, if error occurs:
   backend\venv\Scripts\python.exe -m backend.sample_data
   ```

   This will create sample users and sessions for testing.

### Running the Application

#### Option 1: Local Development (Manual Setup)

1. **Start the Backend Server:**
   ```bash
   cd backend
   source venv/bin/activate  
   
   # On Windows: venv\Scripts\activate

   python main.py
   ```

   if email error backend\venv\Scripts\pip install -r backend/requirements.txt
   
   The backend will start on `http://localhost:8002`

2. **Start the Frontend Development Server:**
   ```bash
   # In a new terminal, from the root directory
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

3. **Access the Application:**
   Open your browser and navigate to `http://localhost:5173`

## 🔐 User Roles & Access

### Description of Roles
- **Admin**: Full system access including user management, session creation/editing, analytics viewing, and report generation
- **Trainer**: Can view users, create and manage training sessions, view assigned sessions
- **Trainee**: Limited access to view their own profile and assigned training sessions

### Admin-Only User Creation Flow
Administrators can create new users through the User Management interface. When creating a user:
1. Admin fills out user details (name, email, username, role)
2. Admin sets a temporary password
3. User account is created with `is_temporary_password` flag set to true
4. System broadcasts the new user creation via WebSocket for real-time updates

### Password Change Requirement
- All newly created users (trainers and trainees) are assigned temporary passwords
- Upon first login, users with temporary passwords are automatically redirected to the password change page
- Users must set a new password (minimum 6 characters) before accessing the main application
- The `is_temporary_password` flag is cleared after successful password change

## 🔄 Real-Time Functionality

### Frontend Connection to Backend
The frontend establishes a WebSocket connection to the backend at startup (after user authentication). The connection is maintained throughout the user session and automatically reconnects if lost.

### Real-Time Data Sync and Persistence
- **User Operations**: When users are created, updated, or deleted, the backend broadcasts events via WebSocket
- **Session Operations**: Session creation, updates, and deletions trigger real-time broadcasts
- **State Management**: The frontend AuthContext listens for WebSocket messages and updates the application state immediately
- **Persistence**: All changes are persisted to the MySQL database and synced across all connected clients

### Technologies Used for Real-Time Updates
- **WebSockets**: Bidirectional communication protocol for real-time data transfer
- **FastAPI WebSocket Support**: Built-in WebSocket endpoints in the backend
- **Connection Manager**: Custom ConnectionManager class handles multiple client connections and broadcasting
- **Event-Driven Updates**: Frontend uses React's useEffect and useCallback to handle WebSocket messages efficiently

## 📄 Report Generation

### How the "Generate Report" Button Works
Located in the Analytics section (accessible only to admins), the "Generate Report" button triggers a backend API call to `/reports/generate`. Users can select the desired format (PDF, CSV, or Excel) before generating.

### Format of Downloaded Reports
Reports include comprehensive data about users and sessions:
- **PDF**: Formatted document with tables showing user details and session information
- **CSV**: Comma-separated values file with user and session data in tabular format
- **Excel**: Multi-sheet workbook with separate sheets for Users and Sessions

### Backend Endpoint or Logic Used for Report Generation
- **Endpoint**: `GET /reports/generate?format={pdf|csv|excel}`
- **Authentication**: Requires admin role and valid JWT token
- **Libraries Used**:
  - **ReportLab** for PDF generation with tables and styling
  - **csv** module for CSV output
  - **OpenPyXL** for Excel file creation
- **Data Sources**: Fetches all users and sessions from the database using SQLAlchemy queries

## 🛠️ API Documentation

### List of Available Endpoints

#### Authentication
- `POST /auth/login` - User login with username/password
- `GET /health` - Health check endpoint

#### User Management
- `GET /users/` - List all users (admin/trainer)
- `GET /users/{user_id}` - Get specific user details
- `POST /users/` - Create new user (admin only)
- `PUT /users/{user_id}` - Update user (admin or self)
- `DELETE /users/{user_id}` - Delete user (admin only)

#### Session Management
- `GET /sessions/` - List all sessions
- `GET /sessions/{session_id}` - Get specific session details
- `POST /sessions/` - Create new session (admin/trainer)
- `PUT /sessions/{session_id}` - Update session (admin/trainer)
- `DELETE /sessions/{session_id}` - Delete session (admin only)

#### Analytics
- `GET /analytics/users` - User count by role (admin only)
- `GET /analytics/sessions` - Session count by status (admin only)

#### Reports
- `GET /reports/generate?format={pdf|csv|excel}` - Generate and download reports (admin only)

#### Real-Time
- `WebSocket /ws` - WebSocket endpoint for real-time updates

### Sample Requests and Responses

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "first_name": "Admin",
    "last_name": "User",
    "is_temporary_password": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "force_password_change": false
}
```

#### Create User
```bash
POST /users/
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "first_name": "New",
  "last_name": "User",
  "role": "trainee",
  "password": "temppass123",
  "is_temporary_password": true
}
```

### Authentication and Authorization Details
- **JWT Authentication**: All protected endpoints require `Authorization: Bearer <token>` header
- **Token Expiration**: Access tokens expire after 30 minutes
- **Role-Based Access**: Certain endpoints restrict access based on user role
- **CORS**: Configured to allow requests from frontend URLs (`http://localhost:3000`, `http://localhost:5173`)

## 🧪 Testing & Deployment

### How to Run Tests
Currently, the project does not include automated tests. Manual testing can be performed by:
1. Running the application locally
2. Using the sample data script to populate test data
3. Testing user flows: login, user creation, session management, report generation
4. Verifying real-time updates by opening multiple browser tabs

### Production Deployment

#### Prerequisites
- MySQL database server
- Python 3.8+ with virtual environment
- Node.js 16+ for building frontend
- Web server (Nginx recommended)

#### Backend Deployment
1. **Set up environment:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Run database migrations:**
   ```bash
   python run_migration.py
   ```

3. **Load sample data (optional):**
   ```bash
   python -m backend.sample_data
   ```

4. **Run with Gunicorn:**
   ```bash
   gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8002
   ```

#### Frontend Deployment
1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Serve static files** with Nginx:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api/ {
           proxy_pass http://localhost:8002/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

#### Environment Variables
Create `.env` in backend directory:
```env
DB_USER=prod_db_user
DB_PASSWORD=secure_password
DB_HOST=prod_db_host
DB_PORT=3306
DB_NAME=training_app
SECRET_KEY=very-secure-random-key
CORS_ORIGINS=https://your-domain.com
```

#### Security Considerations
- Use HTTPS in production
- Change default SECRET_KEY
- Restrict CORS origins
- Use strong database passwords
- Enable MySQL SSL if possible
- Regularly update dependencies

## 📎 Additional Notes

### Known Issues or Limitations
- WebSocket connections may drop during network interruptions (auto-reconnection implemented)
- Report generation for large datasets may take time
- No automated testing suite currently implemented
- Password reset functionality implemented (admins can reset user passwords)

### Future Improvements or Roadmap
- Implement automated testing with pytest and React Testing Library
- Add email notifications for session reminders
- Implement advanced analytics with charts and trends
- Add bulk user import/export functionality
- Implement password reset via email
- Add session attendance tracking and reporting
- Mobile-responsive design improvements
- API rate limiting and security enhancements

## Sample Login Credentials

After running the sample data script, you can use these credentials:

- **Admin:**
  - Username: `admin`
  - Password: `admin123`


## API Documentation

The FastAPI backend provides automatic API documentation at:
- Swagger UI: `http://localhost:8002/docs`
- ReDoc: `http://localhost:8002/redoc`

## Project Structure

```
training-management-system/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── crud.py              # Database operations
│   ├── database.py          # Database configuration
│   ├── sample_data.py       # Sample data script
│   ├── reporting.py         # Report generation logic
│   └── requirements.txt     # Python dependencies
├── src/
│   ├── components/          # React components
│   │   ├── Auth/           # Authentication components
│   │   ├── Dashboard/      # Dashboard components
│   │   ├── Layout/         # Layout components
│   │   ├── Sessions/       # Session management
│   │   ├── Users/          # User management
│   │   ├── Analytics/      # Analytics components
│   │   └── Settings/       # Settings components
│   ├── contexts/           # React contexts
│   ├── App.jsx             # Main app component
│   └── main.jsx            # App entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Node dependencies
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Development

- The backend uses auto-reload when running `python main.py`
- Database schema changes require manual migration or dropping/recreating tables

### Environment Variables

#### Backend (.env)
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_HOST` - MySQL host (default: localhost)
- `DB_PORT` - MySQL port (default: 3306)
- `DB_NAME` - Database name (default: training_app)
- `SECRET_KEY` - JWT secret key
- 
DB_USER=training_user
DB_PASSWORD=training_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=training_app
SECRET_KEY=your-secret-key-here-change-this-in-production
## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.
