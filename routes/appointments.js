const express = require('express');
const router = express.Router();

// Show booking form
router.get('/book', (req, res) => {
    res.render('book_appointment');
});

// Handle booking form submission
router.post('/book', (req, res) => {
    const { name, email, date, time } = req.body;
    const sql = "INSERT INTO appointments (name, email, date, time) VALUES (?, ?, ?, ?)";
    global.db.query(sql, [name, email, date, time], (err, result) => {
        if (err) return res.send(err);
        res.redirect('/appointments/list');
    });
});

// Show search form
router.get('/search', (req, res) => {
    res.render('search_appointments');
});

// Handle search
router.post('/search', (req, res) => {
    const { name } = req.body;
    const sql = "SELECT * FROM appointments WHERE name LIKE ?";
    global.db.query(sql, [`%${name}%`], (err, results) => {
        if (err) return res.send(err);
        res.render('appointment_list', { appointments: results });
    });
});

// List all appointments
router.get('/list', (req, res) => {
    const sql = "SELECT * FROM appointments ORDER BY date, time";
    global.db.query(sql, (err, results) => {
        if (err) return res.send(err);
        res.render('appointment_list', { appointments: results });
    });
});

module.exports = router;
