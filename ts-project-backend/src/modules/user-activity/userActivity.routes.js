const express = require('express');
const router = express.Router();

const authMiddleware = require('../auth/auth.middleware');
const ctrl = require('./userActivity.controller');

router.post('/view', authMiddleware, ctrl.logView);
router.post('/dislike', authMiddleware, ctrl.logDislike);
router.post('/like', authMiddleware, ctrl.likeMovie);

router.delete('/like', authMiddleware, ctrl.unlikeMovie);
module.exports = router;
