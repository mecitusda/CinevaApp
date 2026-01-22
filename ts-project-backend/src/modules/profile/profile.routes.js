const express = require('express');
const router = express.Router();
const ctrl = require('./profile.controller');
const authMiddleware = require('../auth/auth.middleware');
const uploadAvatar = require('../../middlewares/uploadAvatar')

router.post('/avatar', authMiddleware, uploadAvatar.single('avatar'), ctrl.uploadAvatar);
router.get('/', authMiddleware, ctrl.getProfileStats);

module.exports = router;
