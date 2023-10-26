const express = require('express');
const router = express.Router();
const authowner = require('../controllers/authowner');

// Prefix these routes with '/owners'
router.post('/login', authowner.login);
router.post('/register', authowner.register);

module.exports = router;
