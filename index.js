// index.js - Clinic Appointment Manager
const express = require('express');
const path = require('path');
const mysql = require('mysql2');  
require('dotenv').config();
var session = require('express-session');
const expressSanitizer = require("express-sanitizer");

const app = express();
const port = 8000;

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000 // 10 minutes
    }
  })
);

app.use(expressSanitizer());
// Static folder
app.use(express.static(path.join(__dirname, 'public')));

app.locals.clinicData = {clinicName: "Clinic Manager"}


// // Database connection pool
// const db = mysql.createPool({
//     host: 'localhost',
//     user: 'clinic_app',
//     password: 'qwertyuiop',
//     database: 'clinic_db',
//     connectionLimit: 10
// });

// const db = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//     connectionLimit: process.env.DB_CONN_LIMIT || 10
// });

const db = mysql.createPool({
  host: process.env.HEALTH_HOST,
  user: process.env.HEALTH_USER,
  password: process.env.HEALTH_PASSWORD,
  database: process.env.HEALTH_DATABASE,
  connectionLimit: process.env.DB_CONN_LIMIT || 10
});

// Make db accessible globally
global.db = db;

// Routes
const mainRoutes = require('./routes/index');
app.use('/', mainRoutes);

const appointmentsRoutes = require('./routes/appointments');
app.use('/appointments', appointmentsRoutes);

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Start server
app.listen(port, () => console.log(`Clinic app running on http://localhost:${port}`));
