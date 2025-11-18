const express = require('express');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
    res.render('login');
});

// Handle login form
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Dummy login logic
    if (username === 'admin' && password === 'admin') {
        res.send('Login successful');
    } else {
        res.send('Invalid credentials');
    }
});

module.exports = router;
