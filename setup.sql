-- ============================================================
--  MUMBAI LOCAL RAILWAY -- MySQL Setup Script
--  Run this in MySQL terminal:
--  source C:/Users/Krishna Vishwakarma/OneDrive/Desktop/Railwayproject/setup.sql
-- ============================================================

-- Create database
CREATE DATABASE IF NOT EXISTS railway_db;
USE railway_db;

-- Table 1: employees
CREATE TABLE IF NOT EXISTS employees (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  emp_id        VARCHAR(50)  NOT NULL UNIQUE,
  name          VARCHAR(100) NOT NULL,
  designation   VARCHAR(100) NOT NULL,
  registered_on VARCHAR(50)  NOT NULL
);

-- Table 2: students
CREATE TABLE IF NOT EXISTS students (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  stu_id        VARCHAR(50)  NOT NULL UNIQUE,
  name          VARCHAR(100) NOT NULL,
  age           VARCHAR(10),
  gender        VARCHAR(20),
  college       VARCHAR(200),
  contact       VARCHAR(20),
  registered_on VARCHAR(50)
);

-- Table 3: passes
CREATE TABLE IF NOT EXISTS passes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  pass_id     VARCHAR(100) NOT NULL UNIQUE,
  issue_date  VARCHAR(100) NOT NULL,
  stu_id      VARCHAR(50)  NOT NULL,
  issued_by   VARCHAR(50)  NOT NULL,
  ticket_id   VARCHAR(100) NOT NULL,
  coach       VARCHAR(100),
  rail_line   VARCHAR(50),
  source      VARCHAR(100),
  destination VARCHAR(100),
  duration    VARCHAR(50),
  discount    VARCHAR(20),
  pay_id      VARCHAR(100),
  amount      VARCHAR(50),
  pay_mode    VARCHAR(50),
  pay_status  VARCHAR(50),
  FOREIGN KEY (stu_id) REFERENCES students(stu_id)
);

-- Confirm
SHOW TABLES;
SELECT 'railway_db created successfully!' AS Status;
