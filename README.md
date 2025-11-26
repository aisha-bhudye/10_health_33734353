# Clinic Appointment Manager

A web-based appointment management system for clinics, allowing patients to book appointments and staff to manage users and monitor login activity through an audit log.


## Overview

The Clinic Appointment Manager is a Node.js web application built with Express framework that enables:

- **Patients** to book, view, and search for appointments
- **Staff** to authenticate securely and manage the system
- **Administrators** to monitor login activity through comprehensive audit logs

The application uses MySQL for data persistence, EJS for templating, and bcrypt for secure password hashing.

---

## Features

### Patient Features
- **Book Appointments** - Schedule appointments with name, email, date, and time
- **View Appointments** - See all scheduled appointments in a sorted table
- **Search Appointments** - Find appointments by patient name


### Staff Features
- **Secure Authentication** - Login with username and password (bcrypt-hashed)
- **User Registration** - Create new staff accounts
- **Audit Log Access** - View all login attempts with timestamps and IP addresses

### Security Features
- **Password Hashing** - All passwords stored using bcrypt with salt rounds
- **Audit Logging** - Every login attempt logged with success status
- **IP Tracking** - Records IP addresses for security monitoring
- **Connection Pooling** - Efficient database connection management

---

## Technologies

### Application Tier
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **EJS** - Embedded JavaScript templating
- **bcrypt** - Password hashing library

### Data Tier
- **MySQL** - Relational database
- **mysql2** - MySQL client with connection pooling

### Additional Tools
- **body-parser** - Parse incoming request bodies
- **dotenv** (optional) - Environment variable management

---

## Prerequisites

Before installing, ensure you have the following installed:

- **Node.js** (v12.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MySQL** (v5.7 or higher)

Check your versions:
```bash
node --version
npm --version
mysql --version
```

---

## Installation

### 1. Clone the Repository

```bash
git clone 
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`:
- express
- ejs
- mysql2
- body-parser
- express-session
- bcrypt

---

##  Database Setup

### 1. Login to MySQL

```bash
mysql -u root -p
```

### 2. Create Database and Tables

Run the provided SQL script:

```bash
# From MySQL prompt:
source create_db.sql
```

Or manually:

```sql
CREATE DATABASE clinic_db;
USE clinic_db;

-- Create tables (see create_db.sql for full schema)
```

### 3. Insert Test Data

```bash
# From MySQL prompt:
source insert_test_data.sql
```

This creates:
- Sample users with hashed passwords
- Sample appointments
- Initial audit log entries


---

##  Configuration

### Update Database Credentials

Edit `index.js` and update the database connection settings:

```javascript
const db = mysql.createPool({
    host: 'localhost',
    user: 'clinic_app',        // Your MySQL username
    password: 'qwertyuiop',    // Your MySQL password
    database: 'clinic_db',
    connectionLimit: 10
});
```

### Environment Variables (Optional)

Create a `.env` file for sensitive configuration:

```env
DB_HOST=localhost
DB_USER=clinic_app
DB_PASSWORD=qwertyuiop
DB_NAME=clinic_db
PORT=8000
SESSION_SECRET=your_secret_key_here
```

Then update `index.js` to use environment variables:

```javascript
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
});
```

---

## Running the Application

### Start the Server

```bash
node index.js
```

Expected output:
```
Server is running on port 8000
```

### Access the Application

Open your web browser and navigate to:
```
http://localhost:8000
```
Or access via link provided in links.txt

### Default Login Credentials

**Username:** `gold`  
**Password:** `smiths`

---

## Project Structure

```
10_health_33734353/
├── index.js                    # Main application entry point
├── package.json                # Dependencies and project metadata
├── create_db.sql               # Database schema creation script
├── insert_test_data.sql        # Test data insertion script
├── links.txt                   # Deployment URLs
├── report.pdf                  # Project documentation
├── README.md                   # This file
│
├── routes/
│   └── index.js                 # Route handlers for appointments and auth
│   └── appointments.js 
|   └── auth.js 
├── views/
│   ├── layout.ejs               # Home page
│   ├── about.ejs               # About page
│   ├── login.ejs               # Login page
│   ├── register.ejs            # User registration page
│   ├── book_appointment.ejs    # Book appointment form
│   ├── appointment_list.ejs    # List all appointments
│   ├── search_appointments.ejs  # Search appointments
│   └── audit.ejs           # Login audit log
│
└── public/
    └── css/
        └── style.css           # Application styles
```

---
### AI Declaration

I acknowledge the use of [1] ChatGPT (https://chat.openai.com/) to [2] assist with identifying and debugging errors in my code, clarifying programming concepts, and suggesting improvements to code structure. I entered the following prompts on Accessed: 16 November 2025 - 4 Decemeber 2025:

[3] Example prompts used:

“Explain why this error message appears in my code and how to fix it.”

“Suggest a clearer way to structure this function.”

“What is the correct syntax for implementing this feature?”

[4] The output from the generative artificial intelligence was used only to understand errors, explore potential solutions, and improve the organisation of my code. No AI-generated code was copied or included in the final submitted application. All implementation decisions and final code are my own.

## Reference

OpenAI (2025) ChatGPT [Generative AI model]. Available at: https://chat.openai.com/ (Accessed: 16 November 2025 - 4 Decemeber 2025).


##  Academic Information

**Module:** Dynamic Web Applications  
**Institution:** Goldsmiths, University of London  
**Assignment:** Final Lab Project (20% of module grade)

---


