from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import urllib.parse

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

# Database URL format:
# mysql+pymysql://<username>:<password>@<host>:<port>/<database_name>

DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = urllib.parse.quote(os.getenv('DB_PASSWORD', ''))
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME = os.getenv('DB_NAME', 'training_app')

# Check if DB_PASSWORD is set
if not os.getenv('DB_PASSWORD'):
    raise ValueError("DB_PASSWORD environment variable is not set. Please set it in the .env file in the backend directory.")

# Create database if it doesn't exist
temp_db_url = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/"
temp_engine = create_engine(temp_db_url, pool_pre_ping=True)
with temp_engine.connect() as conn:
    conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}"))
    conn.commit()
temp_engine.dispose()

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=False  # Set to False to disable SQL query logging in production
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session in FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
