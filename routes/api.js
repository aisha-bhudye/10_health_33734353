
const express = require("express");
const router = express.Router();

// ========================================
// API ROUTES - JSON responses
// ========================================

// ----------------------------------------
// GET ALL APPOINTMENTS (Base route - like /api/books)
// Route: /api/appointments
// Optional query parameters: search, date, sort
// ----------------------------------------
router.get('/appointments', function (req, res, next) {
    // Get query parameters
    const searchName = req.query.search;
    const searchDate = req.query.date;
    const sortBy = req.query.sort;
    
    // Build base SQL query
    let sqlquery = "SELECT * FROM appointments";
    let conditions = [];
    let params = [];
    
    // Add search condition if provided
    if (searchName) {
        conditions.push("name LIKE ?");
        params.push(`%${searchName}%`);
    }
    
    // Add date condition if provided
    if (searchDate) {
        conditions.push("date = ?");
        params.push(searchDate);
    }
    
    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
        sqlquery += " WHERE " + conditions.join(" AND ");
    }
    
    // Add ORDER BY clause
    if (sortBy === 'name') {
        sqlquery += " ORDER BY name";
    } else if (sortBy === 'date') {
        sqlquery += " ORDER BY date, time";
    } else {
        sqlquery += " ORDER BY date DESC, time DESC";
    }
    
    // Execute the sql query
    global.db.query(sqlquery, params, (err, result) => {
        // Return results as a JSON object
        if (err) {
            res.json(err);
            next(err);
        }
        else {
            res.json(result);
        }
    });
});

// ----------------------------------------
// GET APPOINTMENT STATISTICS
// Route: /api/stats
// ----------------------------------------
router.get('/stats', function (req, res, next) {
    // Query database to get statistics
    let sqlquery = `
        SELECT 
            COUNT(*) as total_appointments,
            COUNT(DISTINCT email) as unique_patients,
            MIN(date) as earliest_appointment,
            MAX(date) as latest_appointment
        FROM appointments
    `;
    
    // Execute the sql query
    global.db.query(sqlquery, (err, result) => {
        // Return results as a JSON object
        if (err) {
            res.json(err);
            next(err);
        }
        else {
            res.json(result[0]);
        }
    });
});

module.exports = router;