CREATE DATABASE IF NOT EXISTS training_app;
CREATE USER IF NOT EXISTS 'training_user'@'localhost' IDENTIFIED BY 'training_password';
GRANT ALL PRIVILEGES ON training_app.* TO 'training_user'@'localhost';
FLUSH PRIVILEGES;
