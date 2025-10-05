import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from .database import SessionLocal
from .models import User, UserRole
from .crud import create_user
from .schemas import UserCreate

def main():
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.username == "admin").first()
        if admin:
            print("Admin user already exists")
            return

        admin_data = UserCreate(
            username="admin",
            email="admin@trainingapp.com",
            password="admin123",
            role=UserRole.admin,
            first_name="System",
            last_name="Administrator"
        )
        admin = create_user(db, admin_data)
        db.commit()
        print(f"Created admin user: {admin.username}")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
