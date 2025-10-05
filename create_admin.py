import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.database import SessionLocal
from backend.models import User, UserRole
from backend.crud import create_user
from backend.schemas import UserCreate

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
            last_name="Administrator",
            is_temporary_password=True
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
