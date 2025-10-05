-- Migration script to add password_change_logs table

CREATE TABLE IF NOT EXISTS password_change_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    performed_by INTEGER REFERENCES users(id),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    details VARCHAR(500)
);
