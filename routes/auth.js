// const express = require('express');
// const router = express.Router();

// // Login page
// router.get('/login', (req, res) => {
//     res.render('login');
// });

// // Handle login form
// router.post('/login', (req, res) => {
//     const { username, password } = req.body;
//     // Dummy login logic
//     if (username === 'admin' && password === 'admin') {
//         res.send('Login successful');
//     } else {
//         res.send('Invalid credentials');
//     }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

// ===============================
// REGISTER FORM
// ===============================
router.get("/register", (req, res) => {
    res.render("register");
});

// ===============================
// REGISTER USER
// ===============================
router.post("/register", (req, res, next) => {
    const { username, first, last, email, password } = req.body;

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) return next(err);

        const sql = `
            INSERT INTO users (username, first, last, email, hashedPassword)
            VALUES (?, ?, ?, ?, ?)
        `;
        const params = [username, first, last, email, hashedPassword];

        global.db.query(sql, params, (err) => {
            if (err) return next(err);

            res.send(`
                <h2>Registration Successful</h2>
                Welcome ${first} ${last}!<br>
                A confirmation email will be sent to ${email}.
            `);
        });
    });
});

// ===============================
// LIST USERS
// ===============================
router.get("/list", (req, res, next) => {
    const sql = `SELECT username, first, last, email FROM users`;

    global.db.query(sql, (err, results) => {
        if (err) return next(err);

        res.render("listusers", { users: results });
    });
});

// ===============================
// LOGIN FORM
// ===============================
router.get("/login", (req, res) => {
    res.render("login");
});

// ===============================
// LOGIN PROCESSING (ALL-IN-ONE, NO HELPER)
// ===============================
router.post("/login", (req, res, next) => {
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

        // No user found
        if (result.length === 0) {
            global.db.query(
                "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
                [username, false, ipAddress]
            );
            return res.send("Login failed: User not found.");
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

            // Correct password
            if (match) {
                global.db.query(
                    "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
                    [username, true, ipAddress]
                );
                return res.send("Login successful! Welcome back, " + username);
            }

            // Wrong password
            global.db.query(
                "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
                [username, false, ipAddress]
            );
            res.send("Login failed: Incorrect password.");
        });
    });
});

// ===============================
// VIEW AUDIT LOG
// ===============================
router.get("/audit", (req, res, next) => {
    const sql = `
        SELECT id, username, login_time, success, ip_address 
        FROM login_audit
        ORDER BY login_time DESC
    `;

    global.db.query(sql, (err, results) => {
        if (err) return next(err);

        res.render("audit", { audits: results });
    });
});

module.exports = router;
