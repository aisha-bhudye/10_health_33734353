
// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcrypt");
// const saltRounds = 10;

// // ===============================
// // REGISTER FORM
// // ===============================
// router.get("/register", (req, res) => {
//     res.render("register");
// });

// // ===============================
// // REGISTER USER
// // ===============================
// router.post("/register", (req, res, next) => {
//     const { username, first, last, email, password } = req.body;

//     bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
//         if (err) return next(err);

//         const sql = `
//             INSERT INTO users (username, first, last, email, hashedPassword)
//             VALUES (?, ?, ?, ?, ?)
//         `;
//         const params = [username, first, last, email, hashedPassword];

//         global.db.query(sql, params, (err) => {
//             if (err) return next(err);

//             res.send(`
//                 <h2>Registration Successful</h2>
//                 Welcome ${first} ${last}!<br>
//                 A confirmation email will be sent to ${email}.
//             `);
//         });
//     });
// });

// // ===============================
// // LIST USERS
// // ===============================
// router.get("/list", (req, res, next) => {
//     const sql = `SELECT username, first, last, email FROM users`;

//     global.db.query(sql, (err, results) => {
//         if (err) return next(err);

//         res.render("listusers", { users: results });
//     });
// });

// // ===============================
// // LOGIN FORM
// // ===============================
// router.get("/login", (req, res) => {
//     res.render("login");
// });

// // ===============================
// // LOGIN PROCESSING (ALL-IN-ONE, NO HELPER)
// // ===============================
// router.post("/login", (req, res, next) => {
//     const { username, password } = req.body;
//     const ipAddress = req.ip;

//     const sql = `SELECT hashedPassword FROM users WHERE username = ?`;

//     global.db.query(sql, [username], (err, result) => {
//         if (err) {
//             global.db.query(
//                 "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
//                 [username, false, ipAddress]
//             );
//             return next(err);
//         }

//         // No user found
//         if (result.length === 0) {
//             global.db.query(
//                 "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
//                 [username, false, ipAddress]
//             );
//             return res.send("Login failed: User not found.");
//         }

//         const hashedPassword = result[0].hashedPassword;

//         bcrypt.compare(password, hashedPassword, (err, match) => {
//             if (err) {
//                 global.db.query(
//                     "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
//                     [username, false, ipAddress]
//                 );
//                 return next(err);
//             }

//             // Correct password
//             if (match) {
//                 global.db.query(
//                     "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
//                     [username, true, ipAddress]
//                 );
//                 return res.send("Login successful! Welcome back, " + username);
//             }

//             // Wrong password
//             global.db.query(
//                 "INSERT INTO login_audit (username, success, ip_address) VALUES (?, ?, ?)",
//                 [username, false, ipAddress]
//             );
//             res.send("Login failed: Incorrect password.");
//         });
//     });
// });

// // ===============================
// // VIEW AUDIT LOG
// // ===============================
// router.get("/audit", (req, res, next) => {
//     const sql = `
//         SELECT id, username, login_time, success, ip_address 
//         FROM login_audit
//         ORDER BY login_time DESC
//     `;

//     global.db.query(sql, (err, results) => {
//         if (err) return next(err);

//         res.render("audit", { audits: results });
//     });
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

const { check, validationResult } = require("express-validator");

// ----------------------------------------
// LOGIN PROTECTION MIDDLEWARE
// ----------------------------------------
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect("./login");
    } else {
        next();
    }
};

// ----------------------------------------
// REGISTER FORM
// ----------------------------------------
router.get("/register", (req, res) => {
    res.render("register", {clinicData: req.app.locals.clinicData, errors: [] });
});

// ----------------------------------------
// REGISTER USER
// ----------------------------------------
router.post(
    "/registered",

    // VALIDATION RULES
    [
        check("email")
            .isEmail()
            .withMessage("Invalid email"),

        check("username")
            .isLength({ min: 5, max: 20 })
            .withMessage("Username must be 5–20 characters"),

        check("password")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters"),

        check("first")
            .notEmpty()
            .withMessage("First name is required"),

        check("last")
            .notEmpty()
            .withMessage("Last name is required")
    ],

    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // Re-render form WITH validation errors
            return res.render("register", { clinicData: req.app.locals.clinicData, errors: errors.array() });
        }

        // Sanitise fields
        let first = req.sanitize(req.body.first);
        let last = req.sanitize(req.body.last);
        let username = req.sanitize(req.body.username);
        let email = req.sanitize(req.body.email);

        const plainPassword = req.body.password;

        bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
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
                    We will email you at <b>${email}</b>.
                `);
            });
        });
    }
);

// ----------------------------------------
// LIST USERS (protected)
// ----------------------------------------
router.get("/list", redirectLogin, (req, res, next) => {
    const sql = `SELECT username, first, last, email FROM users`;

    global.db.query(sql, (err, results) => {
        if (err) return next(err);

        res.render("listusers", { users: results });
    });
});

// ----------------------------------------
// LOGIN FORM
// ----------------------------------------
router.get("/login", (req, res) => {
    res.render("login", { errors: [] });
});

// ----------------------------------------
// LOGIN PROCESSING
// ----------------------------------------
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

// ----------------------------------------
// AUDIT LOG (protected)
// ----------------------------------------
router.get("/audit", redirectLogin, (req, res, next) => {
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

// ----------------------------------------
// LOGOUT
// ----------------------------------------
router.get("/logout", redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect("/");
        res.send("You are now logged out. <a href='/'>Home</a>");
    });
});

module.exports = router;
