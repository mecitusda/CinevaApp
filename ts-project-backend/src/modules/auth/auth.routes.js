const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const authMiddleware = require('./auth.middleware');

// Login
router.post('/login', authController.login);
router.post('/register', authController.register);

// Logout
router.post('/logout', authController.logout);

router.get('/me/mylist', authMiddleware, authController.mylist)
router.get('/me', authMiddleware, authController.me);


module.exports = router;
