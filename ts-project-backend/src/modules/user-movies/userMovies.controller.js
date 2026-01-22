const UserMovie = require('./userMovie.model');
const { getCache, setCache } = require('../../services/cache.service');
// 📄 Kullanıcının listesi
const tmdbService = require('../../services/tmdb.service');

// ➕ Listeye ekle
async function addMovie(req, res) {
  try {
    const movie = await UserMovie.create({
      userId: req.user._id,
      tmdbId: req.body.tmdbId,
    });
    await redisClient.del(`mylist:${req.user._id}:*`);
    return res.status(201).json({ movie });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Movie already in your list',
      });
    }
    throw err;
  }
}

async function getMyMovies(req, res) {
  const userId = req.user._id;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const cacheKey = `mylist:${userId}:${page}:${limit}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.json(cached);

  const movies = await UserMovie.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const enriched = await Promise.all(
    movies.map(async (m) => {
      const detail = await tmdbService.getMovieById(m.tmdbId);
      return {
        ...m,
        movie: detail,
      };
    })
  );
  const response = { page, limit, movies: enriched };
  await setCache(cacheKey, response, 300);
  return res.json(response);
}



// ✏️ Güncelle (status / favorite / rating)
async function updateMovie(req, res) {
  const { id } = req.params;
  const updates = req.body;

  const movie = await UserMovie.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    updates,
    { new: true }
  );

  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }
  await redisClient.del(`mylist:${req.user._id}:*`);
  return res.json({ movie });
}

module.exports = {
  addMovie,
  getMyMovies,
  updateMovie,
};
