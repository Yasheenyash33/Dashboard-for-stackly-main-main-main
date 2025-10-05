from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime
from enum import Enum as PyEnum

from .database import Base

class UserRole(PyEnum):
    admin = "admin"
    trainer = "trainer"
    trainee = "trainee"

class SessionStatus(PyEnum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    is_temporary_password = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sessions_as_trainer = relationship("Session", back_populates="trainer", foreign_keys="Session.trainer_id")
    sessions_as_trainee = relationship("Session", back_populates="trainee", foreign_keys="Session.trainee_id")

    @hybrid_property
    def name(self):
        return f"{self.first_name} {self.last_name}"

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String(500))
    trainer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    trainee_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    scheduled_date = Column(DateTime, nullable=False, index=True)
    duration_minutes = Column(Integer, nullable=False)
    status = Column(Enum(SessionStatus), default=SessionStatus.scheduled, index=True)
    class_link = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    trainer = relationship("User", back_populates="sessions_as_trainer", foreign_keys=[trainer_id])
    trainee = relationship("User", back_populates="sessions_as_trainee", foreign_keys=[trainee_id])

class PasswordChangeLog(Base):
    __tablename__ = "password_change_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String(50), nullable=False)  # 'created', 'changed', 'reset'
    performed_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # None for self-change
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    details = Column(String(500))  # Optional details like IP, etc.

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    performer = relationship("User", foreign_keys=[performed_by])

class AssignedStudent(Base):
    __tablename__ = "assigned_students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    assigned_date = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    teacher = relationship("User", foreign_keys=[teacher_id])
