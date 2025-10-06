#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from backend.database import SessionLocal
from backend.models import User, UserRole
from backend.crud import create_user
from backend.schemas import UserCreate
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.username == "admin").first()
        if admin_user:
            print("Admin user already exists.")
            return

        # Create admin user
        admin_data = UserCreate(
            username="admin",
            email="admin@example.com",
            password="admin123",
            role="admin",
            first_name="Admin",
            last_name="User"
        )

        created_user = create_user(db, admin_data)
        print(f"Admin user created: {created_user.username} with role {created_user.role}")

    except Exception as e:
        print(f"Error creating admin user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
