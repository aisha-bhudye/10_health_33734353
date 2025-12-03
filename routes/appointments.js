const express = require('express');
const router = express.Router();
const rateLimit = require("express-rate-limit");


// LOGIN PROTECTION MIDDLEWARE
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect("./login");
    } else {
        next();
    }
};

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: "Too many login attempts. Please try again later."
});

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
router.get('/list', redirectLogin, (req, res) => {
    const sql = "SELECT * FROM appointments ORDER BY date, time";
    global.db.query(sql, (err, results) => {
        if (err) return res.send(err);
        res.render('appointment_list', { appointments: results });
    });
});

// LOGIN FORM
router.get("/login", (req, res) => {
    res.render("login", { errors: [] });
});

// LOGIN PROCESSING
router.post("/login",loginLimiter, (req, res, next) => {
    const { username, password } = req.body;
    const ipAddress = req.ip;

    const sql = `SELECT hashedPassword FROM users WHERE username = ?`;

    global.db.query(sql, [username], (err, result) => {
        if (err) {
            global.db.query(
                "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
                [username, false, ipAddress]
            );
            return next(err);
        }

        if (result.length === 0) {
            global.db.query(
                "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
                [username, false, ipAddress]
            );
            return res.render("login", {
                errors: [{ msg: "User not found" }]
            });
        }

        const hashedPassword = result[0].hashedPassword;

        bcrypt.compare(password, hashedPassword, (err, match) => {
            if (err) {
                global.db.query(
                    "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
                    [username, false, ipAddress]
                );
                return next(err);
            }

            if (match) {
                req.session.userId = username;

                global.db.query(
                    "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
                    [username, true, ipAddress]
                );
                return res.send("Login successful! Welcome " + username);
            }

            global.db.query(
                "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
                [username, false, ipAddress]
            );
            res.render("login", {
                errors: [{ msg: "Incorrect password" }]
            });
        });
    });
});

// LOGOUT
router.get("/logout", redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect("/");
        res.send("You are now logged out. <a href='/'>Home</a>");
    });
});



module.exports = router;
