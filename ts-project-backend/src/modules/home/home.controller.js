const recoService = require('../../services/recommendation.service');
const tmdbService = require('../../services/tmdb.service');
const UserActivity = require('../user-activity/userActivity.model')

async function getDislikedTmdbIds(userId) {
  const dislikes = await UserActivity.find({
    userId,
    action: 'dislike',
  })
    .select('tmdbId -_id')
    .lean();

  return dislikes.map(d => String(d.tmdbId));
}

async function home(req, res) {
  const userId = req.user?._id;
  console.log("[LOG] home")
  let dislikedIds = [];
  if (userId) {
    dislikedIds = await getDislikedTmdbIds(userId);
  }

  const [trending, discovery] = await Promise.all([
  tmdbService.getTrending({
    excludeIds: dislikedIds,
    page: 1,
  }),
  tmdbService.discoverRandom({
    page: 1,
    excludeIds: dislikedIds,
  }),
]);

  let recommended = null;
  if (userId) {
    recommended = await recoService.getRecommendationsForUser(userId, {
      mode: 'initial',
    });
  }

  return res.json({
    hero: recommended?.hero ?? trending[0],
    trending: {
    movies: trending.movies.slice(0, 20),
    page: 1,
    totalPages: trending.totalPages},
    recommended: recommended?.recommended ?? null,
    discovery: {
    movies: discovery.movies.slice(0, 20),
    page: 1,
    totalPages: discovery.totalPages,
    }
  });
}



module.exports = { home };
