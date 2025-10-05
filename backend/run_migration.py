from backend.database import engine, text

# Run the migration to add is_temporary_password column
migration_sql_is_temp_password = """
ALTER TABLE users
ADD COLUMN is_temporary_password BOOLEAN NOT NULL DEFAULT TRUE;
"""

migration_sql_class_link = """
ALTER TABLE sessions ADD COLUMN class_link VARCHAR(500);
"""

def run_migration(sql: str):
    try:
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
        print("Migration applied successfully.")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    print("Running migration to add is_temporary_password column...")
    run_migration(migration_sql_is_temp_password)
    print("Running migration to add class_link column...")
    run_migration(migration_sql_class_link)
