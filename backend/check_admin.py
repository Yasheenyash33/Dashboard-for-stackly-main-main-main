#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from backend.database import SessionLocal
from backend.models import User

def check_admin_user():
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.username == "admin").first()
        if admin_user:
            print(f"Admin user found: username={admin_user.username}, role={admin_user.role}, email={admin_user.email}")
        else:
            print("Admin user not found")
    except Exception as e:
        print(f"Error checking admin user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_admin_user()
