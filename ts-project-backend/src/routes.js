const express = require('express');
const router = express.Router();

const authRoutes = require('./modules/auth/auth.routes');
const movieRoutes = require('./modules/movies/movies.routes');
const activityRoutes = require('./modules/user-activity/userActivity.routes');
const homeRoutes = require('./modules/home/home.routes');
const userMovieRoutes = require('./modules/user-movies/userMovies.routes');
const profileRoutes = require('./modules/profile/profile.routes');
const seriesRoutes = require('./modules/series/series.routes')
// Auth routes
router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/series', seriesRoutes);
router.use('/activities', activityRoutes);
router.use('/home', homeRoutes);
router.use('/user-movies', userMovieRoutes);
router.use('/profile', profileRoutes);

module.exports = router;
