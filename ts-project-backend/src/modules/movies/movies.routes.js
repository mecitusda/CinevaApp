const express = require('express');
const router = express.Router();
const ctrl = require('./movies.controller');
const authMiddleware = require('../auth/auth.middleware');
const optionalAuth = require('../../middlewares/optionalAuth')

router.get('/genres', ctrl.getMoviesByGenre);
router.get('/person/:id', ctrl.personDetail);
router.get('/trending', ctrl.trending);
router.get('/search', ctrl.search);
router.get('/discover', ctrl.discover);
router.get('/:id/similar', ctrl.similar);
router.get('/:id/trailer', ctrl.getTrailer);
router.get('/:id', ctrl.detail);

router.post('/more',optionalAuth ,ctrl.getMoreMovie)
//router.post('/:id/favorite', authMiddleware, ctrl.addFavorite);
router.post('/:id/following', authMiddleware, ctrl.addFollowing);


//router.delete('/:id/favorite', authMiddleware, ctrl.removeFavorite);
router.delete('/:id/following', authMiddleware, ctrl.removeFollowing);



module.exports = router;
