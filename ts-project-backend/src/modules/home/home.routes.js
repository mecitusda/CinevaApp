const express = require('express');
const router = express.Router();
const authMiddleware = require('../auth/auth.middleware');
const ctrl = require('./home.controller');
const optionalAuth = require('../../middlewares/optionalAuth');

router.get('/', optionalAuth, ctrl.home);

module.exports = router;
