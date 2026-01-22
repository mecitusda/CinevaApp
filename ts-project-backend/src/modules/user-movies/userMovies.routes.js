const express = require('express');
const router = express.Router();
const ctrl = require('./userMovies.controller');
const authMiddleware = require('../auth/auth.middleware');

router.use(authMiddleware); // 🔐 hepsi login ister

router.post('/', ctrl.addMovie);
router.get('/', ctrl.getMyMovies);
router.patch('/:id', ctrl.updateMovie);

module.exports = router;
