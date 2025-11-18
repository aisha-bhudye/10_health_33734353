-- Create database for Clinic Appointment Manager
CREATE DATABASE IF NOT EXISTS clinic_db;
USE clinic_db;

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the application user
CREATE USER IF NOT EXISTS 'clinic_app'@'localhost' IDENTIFIED BY 'qwertyuiop';
GRANT ALL PRIVILEGES ON clinic_db.* TO 'clinic_app'@'localhost';

FLUSH PRIVILEGES;
