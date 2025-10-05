#!/usr/bin/env python3
"""
Sample data insertion script for the Training Management API.

This script creates sample users and sessions in the MySQL database
for testing and demonstration purposes.

Usage:
    python -m backend.sample_data

Requirements:
    - MySQL database must be running and accessible
    - Database tables must be created (run backend.main first)
    - Environment variables set for database connection
"""

import os
import sys
from datetime import datetime, timedelta, timezone

UTC = timezone.utc
from sqlalchemy.orm import Session
from sqlalchemy import text

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine
from models import User, Session as TrainingSession, UserRole, SessionStatus
from crud import create_user, create_session
import schemas

def create_sample_users(db: Session):
    """Create sample users with different roles."""
    print("Creating sample users...")

    # Create admin user
    admin_data = schemas.UserCreate(
        username="admin",
        email="admin@trainingapp.com",
        password="admin123",
        role=UserRole.admin,
        first_name="System",
        last_name="Administrator"
    )
    admin = create_user(db, admin_data)
    print(f"Created admin user: {admin.username}")

    # Create trainers
    trainers_data = [
        schemas.UserCreate(
            username="john_trainer",
            email="john.trainer@trainingapp.com",
            password="trainer123",
            role=UserRole.trainer,
            first_name="John",
            last_name="Trainer"
        ),
        schemas.UserCreate(
            username="sarah_trainer",
            email="sarah.trainer@trainingapp.com",
            password="trainer123",
            role=UserRole.trainer,
            first_name="Sarah",
            last_name="Instructor"
        ),
        schemas.UserCreate(
            username="mike_trainer",
            email="mike.trainer@trainingapp.com",
            password="trainer123",
            role=UserRole.trainer,
            first_name="Mike",
            last_name="Coach"
        )
    ]

    trainers = []
    for trainer_data in trainers_data:
        trainer = create_user(db, trainer_data)
        trainers.append(trainer)
        print(f"Created trainer: {trainer.username}")

    # Create trainees
    trainees_data = [
        schemas.UserCreate(
            username="alice_trainee",
            email="alice.student@trainingapp.com",
            password="trainee123",
            role=UserRole.trainee,
            first_name="Alice",
            last_name="Student"
        ),
        schemas.UserCreate(
            username="bob_trainee",
            email="bob.learner@trainingapp.com",
            password="trainee123",
            role=UserRole.trainee,
            first_name="Bob",
            last_name="Learner"
        ),
        schemas.UserCreate(
            username="carol_trainee",
            email="carol.pupil@trainingapp.com",
            password="trainee123",
            role=UserRole.trainee,
            first_name="Carol",
            last_name="Pupil"
        ),
        schemas.UserCreate(
            username="david_trainee",
            email="david.apprentice@trainingapp.com",
            password="trainee123",
            role=UserRole.trainee,
            first_name="David",
            last_name="Apprentice"
        ),
        schemas.UserCreate(
            username="eve_trainee",
            email="eve.scholar@trainingapp.com",
            password="trainee123",
            role=UserRole.trainee,
            first_name="Eve",
            last_name="Scholar"
        )
    ]

    trainees = []
    for trainee_data in trainees_data:
        trainee = create_user(db, trainee_data)
        trainees.append(trainee)
        print(f"Created trainee: {trainee.username}")

    return admin, trainers, trainees

def create_sample_sessions(db: Session, trainers, trainees):
    """Create sample training sessions."""
    print("\nCreating sample sessions...")

    # Sample session data
    session_data = [
        {
            "title": "Introduction to Python Programming",
            "description": "Learn the basics of Python programming language including variables, loops, and functions.",
            "trainer": trainers[0],  # John Trainer
            "trainee": trainees[0],  # Alice
            "scheduled_date": datetime.now(UTC) + timedelta(days=1),
            "duration_minutes": 120,
            "status": SessionStatus.scheduled
        },
        {
            "title": "Advanced JavaScript Concepts",
            "description": "Deep dive into advanced JavaScript topics including closures, prototypes, and async programming.",
            "trainer": trainers[1],  # Sarah Instructor
            "trainee": trainees[1],  # Bob
            "scheduled_date": datetime.now(UTC) + timedelta(days=2),
            "duration_minutes": 90,
            "status": SessionStatus.scheduled
        },
        {
            "title": "React Fundamentals",
            "description": "Master the fundamentals of React including components, state management, and hooks.",
            "trainer": trainers[2],  # Mike Coach
            "trainee": trainees[2],  # Carol
            "scheduled_date": datetime.now(UTC) - timedelta(days=1),  # Past session
            "duration_minutes": 180,
            "status": SessionStatus.completed
        },
        {
            "title": "Database Design Principles",
            "description": "Learn about relational database design, normalization, and SQL best practices.",
            "trainer": trainers[0],  # John Trainer
            "trainee": trainees[3],  # David
            "scheduled_date": datetime.now(UTC) + timedelta(days=3),
            "duration_minutes": 150,
            "status": SessionStatus.scheduled
        },
        {
            "title": "Web Development with Django",
            "description": "Build web applications using Django framework including models, views, and templates.",
            "trainer": trainers[1],  # Sarah Instructor
            "trainee": trainees[4],  # Eve
            "scheduled_date": datetime.now(UTC) - timedelta(days=2),  # Past session
            "duration_minutes": 120,
            "status": SessionStatus.completed
        },
        {
            "title": "Machine Learning Basics",
            "description": "Introduction to machine learning concepts and algorithms using Python.",
            "trainer": trainers[2],  # Mike Coach
            "trainee": trainees[0],  # Alice
            "scheduled_date": datetime.now(UTC) + timedelta(days=5),
            "duration_minutes": 240,
            "status": SessionStatus.scheduled
        },
        {
            "title": "API Development with FastAPI",
            "description": "Learn to build REST APIs using FastAPI framework with automatic documentation.",
            "trainer": trainers[0],  # John Trainer
            "trainee": trainees[1],  # Bob
            "scheduled_date": datetime.now(UTC) - timedelta(days=3),  # Past session
            "duration_minutes": 90,
            "status": SessionStatus.cancelled
        }
    ]

    sessions = []
    for data in session_data:
        session_create = schemas.SessionCreate(
            title=data["title"],
            description=data["description"],
            trainer_id=data["trainer"].id,
            trainee_id=data["trainee"].id,
            scheduled_date=data["scheduled_date"],
            duration_minutes=data["duration_minutes"],
            status=data["status"]
        )

        session = create_session(db, session_create)
        sessions.append(session)
        print(f"Created session: {session.title} ({session.status.value})")

    return sessions

def main():
    """Main function to run the sample data insertion."""
    print("Starting sample data insertion...")

    # Check environment variables
    db_name = os.getenv('DB_NAME', 'training_app')
    print(f"Using database: {db_name}")

    # Create database session
    db = SessionLocal()

    # Clear existing sample data to avoid duplicates
    print("Clearing existing sample data...")
    db.execute(text("DELETE FROM sessions"))
    db.execute(text("DELETE FROM users"))
    db.commit()

    try:
        # Create sample users
        admin, trainers, trainees = create_sample_users(db)

        # Create sample sessions
        sessions = create_sample_sessions(db, trainers, trainees)

        # Commit all changes
        db.commit()

        print("\n✅ Sample data insertion completed successfully!")
        print(f"Created {len([admin] + trainers + trainees)} users and {len(sessions)} sessions")

        print("\n📋 Sample Login Credentials:")
        print("Admin: username='admin', password='admin123'")
        print("Trainer: username='john_trainer', password='trainer123'")
        print("Trainee: username='alice_trainee', password='trainee123'")

    except Exception as e:
        print(f"❌ Error during sample data insertion: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
