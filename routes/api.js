const express = require("express");
const router = express.Router();

// ========================================
// API ROUTES - JSON responses
// ========================================

// ----------------------------------------
// GET ALL APPOINTMENTS
// Route: /api/appointments
// Returns: JSON array of all appointments
// ----------------------------------------
router.get('/appointments', (req, res, next) => {
    const sql = `
        SELECT * FROM appointments
        ORDER BY date DESC, time DESC
    `;
    
    global.db.query(sql, (err, results) => {
        if (err) {
            res.json({ error: err.message });
            return next(err);
        }
        res.json(results);
    });
});

// ----------------------------------------
// SEARCH APPOINTMENTS BY PATIENT NAME
// Route: /api/appointments/search?name=john
// Returns: JSON array of matching appointments
// ----------------------------------------
router.get('/appointments/search', (req, res, next) => {
    const searchName = req.query.name || '';
    
    if (!searchName) {
        return res.json({ error: 'Please provide a search name parameter' });
    }
    
    const sql = `
        SELECT * FROM appointments
        WHERE name LIKE ?
        ORDER BY date DESC, time DESC
    `;
    
    const searchPattern = `%${searchName}%`;
    
    global.db.query(sql, [searchPattern], (err, results) => {
        if (err) {
            res.json({ error: err.message });
            return next(err);
        }
        res.json(results);
    });
});

// ----------------------------------------
// GET APPOINTMENTS BY DATE
// Route: /api/appointments/date?date=2025-12-01
// Returns: JSON array of appointments on that date
// ----------------------------------------
router.get('/appointments/date', (req, res, next) => {
    const date = req.query.date;
    
    if (!date) {
        return res.json({ error: 'Please provide a date parameter (YYYY-MM-DD)' });
    }
    
    const sql = `
        SELECT * FROM appointments
        WHERE date = ?
        ORDER BY time
    `;
    
    global.db.query(sql, [date], (err, results) => {
        if (err) {
            res.json({ error: err.message });
            return next(err);
        }
        res.json(results);
    });
});

// ----------------------------------------
// GET APPOINTMENTS BY EMAIL
// Route: /api/appointments/email?email=john@email.com
// Returns: JSON array of appointments for that email
// ----------------------------------------
router.get('/appointments/email', (req, res, next) => {
    const email = req.query.email;
    
    if (!email) {
        return res.json({ error: 'Please provide an email parameter' });
    }
    
    const sql = `
        SELECT * FROM appointments
        WHERE email = ?
        ORDER BY date DESC, time DESC
    `;
    
    global.db.query(sql, [email], (err, results) => {
        if (err) {
            res.json({ error: err.message });
            return next(err);
        }
        res.json(results);
    });
});

// ----------------------------------------
// GET APPOINTMENT STATISTICS
// Route: /api/stats
// Returns: JSON object with appointment statistics
// ----------------------------------------
router.get('/stats', (req, res, next) => {
    const sql = `
        SELECT 
            COUNT(*) as total_appointments,
            COUNT(DISTINCT email) as unique_patients,
            MIN(date) as earliest_appointment,
            MAX(date) as latest_appointment
        FROM appointments
    `;
    
    global.db.query(sql, (err, results) => {
        if (err) {
            res.json({ error: err.message });
            return next(err);
        }
        res.json(results[0]);
    });
});

// ----------------------------------------
// GET UPCOMING APPOINTMENTS
// Route: /api/appointments/upcoming
// Returns: JSON array of future appointments
// ----------------------------------------
router.get('/appointments/upcoming', (req, res, next) => {
    const sql = `
        SELECT * FROM appointments
        WHERE date >= CURDATE()
        ORDER BY date, time
    `;
    
    global.db.query(sql, (err, results) => {
        if (err) {
            res.json({ error: err.message });
            return next(err);
        }
        res.json(results);
    });
});

module.exports = router;