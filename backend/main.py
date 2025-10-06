import os
import sys
import jwt
import json
import io
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    status,
    WebSocket,
    WebSocketDisconnect,
    Request,
)
from fastapi.responses import (
    StreamingResponse,
    Response,
    FileResponse,
    JSONResponse,
    PlainTextResponse,
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from .config import get_settings

# Initialize FastAPI app
app = FastAPI(title="Training Management API", version="1.0.0")

# Get application settings
settings = get_settings()

# Mount static files
app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static")), name="static")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_CREDENTIALS,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
    expose_headers=["*"],
    max_age=settings.CORS_MAX_AGE
)
from fastapi.exceptions import RequestValidationError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse, Response, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from sqlalchemy.orm import Session
from typing import List
import jwt
import json
import io
import logging
from datetime import datetime, timedelta
import os
import sys
from dotenv import load_dotenv

# Add the project root to sys.path to allow absolute imports
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

load_dotenv()

from . import models, schemas, crud, reporting
from .database import engine, get_db, SessionLocal

# Create database tables
models.Base.metadata.create_all(bind=engine)

# CORS middleware for frontend integration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "ws://localhost:5173",
    "ws://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "ws://localhost:5174",
    "ws://127.0.0.1:5174"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600
)

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

security = HTTPBearer()

# WebSocket connection manager for real-time updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, token: str = None):
        # Verify token on WebSocket connection
        if token is None:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
        except jwt.PyJWTError:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        await websocket.accept()
        self.active_connections.append(websocket)
        logging.info(f"WebSocket connection established. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logging.info(f"WebSocket connection closed. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logging.error(f"Failed to send message to WebSocket: {e}")
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)
        if disconnected:
            logging.warning(f"Removed {len(disconnected)} disconnected WebSocket connections")

manager = ConnectionManager()

# Authentication functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            logging.warning("Token payload missing 'sub' claim")
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.ExpiredSignatureError:
        logging.warning("Token has expired")
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError as e:
        logging.warning(f"Token validation failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(db: Session = Depends(get_db), username: str = Depends(verify_token)):
    logging.info(f"get_current_user called with username: {username}")
    user = crud.get_user_by_username(db, username)
    if not user:
        logging.warning(f"User not found for username: {username}")
        raise HTTPException(status_code=404, detail="User not found")
    logging.info(f"User found: {user.username} with role: {user.role}")
    return user

# Authentication routes
@app.post("/auth/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
        "force_password_change": user.is_temporary_password
    }

@app.post("/auth/change-password")
async def change_password(request: schemas.ChangePasswordRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # For non-admin users, verify current password
    if current_user.role.value != "admin":
        if not request.current_password:
            raise HTTPException(status_code=400, detail="Current password required")
        if not crud.authenticate_user(db, current_user.username, request.current_password):
            raise HTTPException(status_code=401, detail="Invalid current password")

    updated_user = crud.change_password(db, current_user.id, request.new_password, current_user.id)

    # Broadcast password change event
    await manager.broadcast({
        "type": "password_changed",
        "data": {
            "user_id": current_user.id,
            "action": "changed",
            "message": f"Password changed for user {current_user.name}"
        }
    })

    return {"message": "Password changed successfully"}

@app.post("/auth/reset-password/{user_id}")
async def reset_password(user_id: int, request: schemas.ResetPasswordRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can reset passwords")

    target_user = crud.get_user(db, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = crud.reset_password(db, user_id, request.new_password, current_user.id)

    # Broadcast password reset event
    await manager.broadcast({
        "type": "password_reset",
        "data": {
            "user_id": user_id,
            "reset_by": current_user.id,
            "new_password": request.new_password,  # In production, don't broadcast password
            "message": f"Password reset for user {target_user.name}. New temporary password: {request.new_password}"
        }
    })

    return {"message": "Password reset successfully"}

@app.post("/auth/admin-change-password")
async def admin_change_password(request: schemas.ChangePasswordRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can change password without current password")

    updated_user = crud.change_password(db, current_user.id, request.new_password, current_user.id)

    # Broadcast password change event
    await manager.broadcast({
        "type": "password_changed",
        "data": {
            "user_id": current_user.id,
            "action": "changed",
            "message": f"Admin password changed for user {current_user.name}"
        }
    })

    return {"message": "Password changed successfully"}

# AssignedStudent routes
@app.get("/assignments/", response_model=List[schemas.AssignedStudentWithDetails])
def read_assignments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role.value not in ["admin", "trainer"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    assignments = crud.get_assigned_students(db, skip=skip, limit=limit)
    # Load relationships
    result = []
    for assignment in assignments:
        result.append({
            "id": assignment.id,
            "student": assignment.student,
            "teacher": assignment.teacher,
            "assigned_date": assignment.assigned_date
        })
    return result

@app.post("/assignments/", response_model=schemas.AssignedStudent)
async def assign_student(assignment: schemas.AssignedStudentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can assign students")

    # Check if student and teacher exist
    student = crud.get_user(db, assignment.student_id)
    teacher = crud.get_user(db, assignment.teacher_id)
    if not student or student.role != "trainee":
        raise HTTPException(status_code=400, detail="Invalid student")
    if not teacher or teacher.role != "trainer":
        raise HTTPException(status_code=400, detail="Invalid teacher")

    created_assignment = crud.assign_student_to_teacher(db, assignment.student_id, assignment.teacher_id)

    # Broadcast assignment event
    await manager.broadcast({
        "type": "student_assigned",
        "data": {
            "assignment_id": created_assignment.id,
            "student_id": assignment.student_id,
            "teacher_id": assignment.teacher_id,
            "assigned_date": created_assignment.assigned_date.isoformat()
        }
    })

    return created_assignment

@app.delete("/assignments/{student_id}/{teacher_id}")
async def unassign_student(student_id: int, teacher_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can unassign students")

    success = crud.unassign_student_from_teacher(db, student_id, teacher_id)
    if not success:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Broadcast unassignment event
    await manager.broadcast({
        "type": "student_unassigned",
        "data": {
            "student_id": student_id,
            "teacher_id": teacher_id
        }
    })

    return {"message": "Student unassigned successfully"}

# User routes
@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    logging.info(f"read_users called by user {current_user.username} with role {current_user.role}")
    if current_user.role.value not in ["admin", "trainer"]:
        logging.warning(f"User {current_user.username} not authorized for users")
        raise HTTPException(status_code=403, detail="Not authorized")
    users = crud.get_users(db, skip=skip, limit=limit)
    logging.info(f"Retrieved {len(users)} users")
    logging.info("read_users completed")
    return users

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role.value not in ["admin", "trainer"] and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    user = crud.get_user(db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/users/")
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    logging.info(f"create_user called by user {current_user.username} with role {current_user.role}")
    if current_user.role != models.UserRole.admin:
        logging.warning(f"User {current_user.username} with role {current_user.role} not authorized to create users")
        raise HTTPException(status_code=403, detail="Only admins can create users")

    # Check if username or email already exists
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    created_user, temporary_password = crud.create_user(db, user)

    # Log user creation
    crud.log_user_creation(db, created_user.id, current_user.id)

    # Broadcast user creation event (without password)
    await manager.broadcast({
        "type": "user_created",
        "data": {
            "user_id": created_user.id,
            "action": "created",
            "user": {
                **created_user.__dict__,
                'name': f"{created_user.first_name} {created_user.last_name}"
            }
        }
    })

    # Return user data with temporary password for secure sharing by admin
    return {
        "user": created_user,
        "temporary_password": temporary_password,
        "message": f"User {created_user.name} created successfully. Share the temporary password securely with the user."
    }

@app.put("/users/{user_id}", response_model=schemas.User)
async def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role.value != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    updated_user = crud.update_user(db, user_id, user_update)
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Broadcast user update event
    await manager.broadcast({
        "type": "user_updated",
        "data": {
            "user_id": user_id,
            "action": "updated",
            "user": {
                **updated_user.__dict__,
                'name': f"{updated_user.first_name} {updated_user.last_name}"
            }
        }
    })

    return updated_user

@app.delete("/users/{user_id}")
async def delete_user(user_id: int, request: Request, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Handle CORS preflight
    if request.method == "OPTIONS":
        response = JSONResponse(content={})
        origin = request.headers.get("origin")
        if origin in origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Methods"] = "DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
            response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete users")

    success = crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")

    # Broadcast user deletion event
    await manager.broadcast({
        "type": "user_deleted",
        "data": {
            "user_id": user_id,
            "action": "deleted"
        }
    })

    # Create response with CORS headers
    response = JSONResponse(content={"message": "User deleted successfully"})
    origin = request.headers.get("origin")
    if origin in origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# Session routes
@app.get("/sessions/", response_model=List[schemas.Session])
def read_sessions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    logging.info(f"read_sessions called by user {current_user.username} with role {current_user.role}")
    sessions = crud.get_sessions(db, skip=skip, limit=limit)
    logging.info(f"Retrieved {len(sessions)} sessions")
    logging.info("read_sessions completed")
    return sessions

@app.get("/sessions/{session_id}", response_model=schemas.Session)
def read_session(session_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    session = crud.get_session(db, session_id=session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@app.post("/sessions/", response_model=schemas.Session)
async def create_session(session: schemas.SessionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role.value not in ["admin", "trainer"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    created_session = crud.create_session(db, session)

    # Broadcast session creation event
    await manager.broadcast({
        "type": "session_created",
        "data": {
            "session_id": created_session.id,
            "status": created_session.status.value,
            "updated_at": created_session.updated_at.isoformat()
        }
    })

    return created_session

@app.put("/sessions/{session_id}", response_model=schemas.Session)
async def update_session(session_id: int, session_update: schemas.SessionUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role.value not in ["admin", "trainer"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    updated_session = crud.update_session(db, session_id, session_update)
    if updated_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    # Broadcast session update event
    await manager.broadcast({
        "type": "session_updated",
        "data": {
            "session_id": session_id,
            "status": updated_session.status.value,
            "updated_at": updated_session.updated_at.isoformat()
        }
    })

    return updated_session

@app.delete("/sessions/{session_id}")
async def delete_session(session_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete sessions")

    success = crud.delete_session(db, session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")

    # Broadcast session deletion event
    await manager.broadcast({
        "type": "session_deleted",
        "data": {
            "session_id": session_id
        }
    })

    return {"message": "Session deleted successfully"}

# Analytics routes
@app.get("/analytics/users")
def get_user_analytics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.get_user_count_by_role(db)

@app.get("/analytics/sessions")
def get_session_analytics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.get_session_count_by_status(db)

# Report generation endpoint
@app.get("/reports/generate")
def generate_report(format: str = "pdf", db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    users = crud.get_users(db)
    sessions = crud.get_sessions(db)

    if format == "csv":
        report_data = reporting.generate_csv_report(users, sessions)
        return StreamingResponse(
            io.StringIO(report_data.getvalue()),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=training-report-{datetime.now().strftime('%Y%m%d')}.csv"}
        )
    elif format == "excel":
        report_data = reporting.generate_excel_report(users, sessions)
        return StreamingResponse(
            report_data,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=training-report-{datetime.now().strftime('%Y%m%d')}.xlsx"}
        )
    elif format == "pdf":
        report_data = reporting.generate_pdf_report(users, sessions)
        return StreamingResponse(
            report_data,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=training-report-{datetime.now().strftime('%Y%m%d')}.pdf"}
        )
    else:
        raise HTTPException(status_code=400, detail="Unsupported format. Use 'pdf', 'excel', or 'csv'")

# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Extract token from query params
    token = websocket.query_params.get("token")
    await manager.connect(websocket, token)
    if websocket not in manager.active_connections:
        return
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Client message: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        if websocket in manager.active_connections:
            manager.disconnect(websocket)

@app.get('/.well-known/appspecific/com.chrome.devtools.json')
async def chrome_devtools():
    return JSONResponse(
        content={
            "version": "1.0",
            "enabled": True
        },
        status_code=200
    )

# Favicon route
@app.get('/favicon.ico', include_in_schema=False)
async def favicon():
    return FileResponse(
        os.path.join(os.path.dirname(__file__), 'static', 'favicon.ico'),
        media_type='image/x-icon'
    )

# Root endpoint
@app.get("/")
def root():
    return {"message": "Training Management API", "docs": "/docs", "health": "/health"}

# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Exception handlers
from fastapi.responses import JSONResponse

@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    if request.method == "OPTIONS":
        response = PlainTextResponse("")
        origin = request.headers.get("origin")
        if origin in origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Max-Age"] = "3600"
        return response
    response = await call_next(request)
    origin = request.headers.get("origin")
    if origin in origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    response = JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )
    origin = request.headers.get("origin")
    if origin in origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation error", "errors": exc.errors()}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Update the main execution block
if __name__ == "__main__":
    import uvicorn
    import logging
    
    logging.basicConfig(level=logging.INFO)
    
    config = uvicorn.Config(
        "backend.main:app",
        host="localhost",
        port=8002,
        reload=True,
        log_level="info",
        access_log=True,
        workers=1,
        proxy_headers=True,
        forwarded_allow_ips="*"
    )
    
    server = uvicorn.Server(config)
    server.run()
