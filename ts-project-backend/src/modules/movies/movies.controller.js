const tmdbService = require('../../services/tmdb.service');
const recommendationService = require('../../services/recommendation.service')
const activityService = require('../user-activity/userActivity.service');
const UserActivity = require('../user-activity/userActivity.model');
const User = require('../auth/user.model');
const { getCache, setCache } = require('../../services/cache.service');
const crypto = require("crypto");

function hashIds(ids = []) {
  return crypto
    .createHash("md5")
    .update(ids.sort().join(","))
    .digest("hex");
}

async function getDislikedTmdbIds(userId) {
  const cacheKey = `user:${userId}:disliked`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const dislikes = await UserActivity.find({
    userId,
    action: 'dislike',
  })
    .select('tmdbId -_id')
    .lean();

  const ids = dislikes.map(d => String(d.tmdbId));

  await setCache(cacheKey, ids, 300); // 5 dk
  return ids;
}

function computeSearchScore(item, query) {
  const q = query.toLowerCase();
  const title = item.title.toLowerCase();

  let score = 0;

  if (title === q) score += 50;
  if (title.startsWith(q)) score += 30;
  if (title.includes(q)) score += 15;

  score += item.popularity ?? 0;
  score += (item.voteAverage ?? 0) * 2;

  return score;
}



async function trending(req, res) {
  const movies = await tmdbService.getTrending();
  res.json({ movies });
}

async function detail(req, res) {
  const movieId = req.params.id;

  const movieCacheKey = `movie:detail:${movieId}`;
  const castCacheKey = `movie:cast:${movieId}`;
  const directorCacheKey = `movie:directors:${movieId}`; // 👈 YENİ

  // 🎬 MOVIE
  let movie = await getCache(movieCacheKey);

  if (!movie) {
    movie = await tmdbService.getMovieById(movieId);
    await setCache(movieCacheKey, movie, 60 * 60 * 6); // 6 saat
  }

  // 🎭 CAST
  let cast = await getCache(castCacheKey);

  if (!cast) {
    cast = await tmdbService.getMovieCast(movieId);
    await setCache(castCacheKey, cast, 60 * 60 * 2); // 2 saat
  }

  // 🎬🎥 DIRECTORS
  let directors = await getCache(directorCacheKey);

  if (!directors) {
    directors = await tmdbService.getMovieDirectors(movieId);
    await setCache(directorCacheKey, directors, 60 * 60 * 2); // cast ile aynı TTL
  }

  // 🔥 SIDE EFFECT → HER ZAMAN
  if (req.user) {
    await activityService.logActivity({
      userId: req.user._id,
      tmdbId: movie.tmdbId,
      action: 'view',
      meta: {
        genreIds: movie.genres.map(g => g.id),
        voteAverage: movie.voteAverage,
      },
    });
  }

  return res.json({
    movie,
    cast,
    directors, // 👈 FRONTEND HAZIR
  });
}



async function search(req, res) {
  const { q, page = 1, type = 'all' } = req.query;
  if (!q) {
    return res.status(400).json({ message: 'q is required' });
  }

  const cacheKey = `search:q=${q}:type=${type}:page=${page}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.json(cached);

  let results = await tmdbService.searchMulti({
    query: q,
    page,
  });

  if (type !== 'all') {
    results = results.filter(r => r.mediaType === type);
  }

  results.sort((a, b) =>
    computeSearchScore(b, q) - computeSearchScore(a, q)
  );

  const response = {
    results,
    page: Number(page),
    hasMore: results.length > 0,
  };

  await setCache(cacheKey, response, 300);
  res.json(response);
}

async function discover(req, res) {
  const { genre, minVote, sort } = req.query;

  const movies = await tmdbService.discoverMovies({
    genre,
    minVote,
    sort,
  });

  res.json({ movies });
}

async function addFavorite(req, res) {
  const { tmdbId } = req.body;
  if (!tmdbId) return res.status(400).json({ message: 'tmdbId is required' });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { favorites: tmdbId } },
    { new: true }
  );

  res.json({ favorites: user.favorites });
}

async function removeFavorite(req, res) {
  const { tmdbId } = req.body;
  if (!tmdbId) return res.status(400).json({ message: 'tmdbId is required' });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { favorites: tmdbId } },
    { new: true }
  );

  res.json({ favorites: user.favorites });
}

async function addFollowing(req, res) {
  const {
    tmdbId,
    mediaType,
    title,
    posterPath,
  } = req.body;
  if (!tmdbId || !mediaType || !title) {
    return res.status(400).json({
      message: "tmdbId, mediaType and title are required",
    });
  }

  if (!["movie", "tv"].includes(mediaType)) {
    return res.status(400).json({
      message: "mediaType must be 'movie' or 'tv'",
    });
  }

  // 1️⃣ USER → following (duplicate ENGEL)
  await User.findOneAndUpdate(
    {
      _id: req.user._id,
      "following.tmdbId": { $ne: tmdbId },
    },
    {
      $push: {
        following: {
          tmdbId,
          mediaType,
          title,
          posterPath,
          addedAt: new Date(),
        },
      },
    }
  );

  // 2️⃣ RESPONSE hemen dön
  res.status(201).json({ ok: true });

  // 3️⃣ ACTIVITY → async log
  setImmediate(() => {
    activityService.logActivity({
      userId: req.user._id,
      tmdbId,
      mediaType,
      action: "follow",
      meta: {
        title,
        posterPath,
      },
    });
  });
}

async function removeFollowing(req, res) {
  const { tmdbId, mediaType } = req.body;

  if (!tmdbId || !mediaType) {
    return res.status(400).json({
      message: "tmdbId and mediaType are required",
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {
        following: {
          tmdbId,
          mediaType,
        },
      },
    },
    { new: true }
  );

  return res.json({
    following: user.following,
  });
}


async function getTrailer(req, res) {
  try {
    console.log("istek geldi")
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'movie id required' });
    }

    const trailer = await tmdbService.getMovieTrailer(id);

    res.json({ trailer }); // trailer null olabilir
  } catch (err) {
    console.error('Trailer error:', err.message);
    res.status(500).json({ message: 'Trailer fetch failed' });
  }
}

async function getMoreMovie(req, res) {
  const userId = req.user?._id;
  const { type, excludeIds = [], limit = 6 } = req.body;
  console.log("[LOG] more movie params: ", type , excludeIds , limit)
  let dislikedIds = [];
  if (userId) {
    dislikedIds = await getDislikedTmdbIds(userId);
  } 

  const finalExcludeIds = [
    ...new Set([
      ...excludeIds.map(String),
      ...dislikedIds.map(String),
    ]),
  ];

  let movies = [];

  switch (type) {
    case 'trending': {
      const resData = await tmdbService.getTrending({
        excludeIds: finalExcludeIds,
        limit,
      });
      movies = resData.movies;
      break;
    }

    case 'discovery': {
      const resData = await tmdbService.discoverRandom({
        excludeIds: finalExcludeIds,
        limit,
      });
      movies = resData.movies;
      break;
    }

    case 'recommended':
      if (!userId) return res.json({ movies: [] });

      movies = await recommendationService.getRecommendationsForUser(
        userId,
        {
          excludeIds: finalExcludeIds,
          limit,
          mode: 'refill',
        }
      );
      break;

    default:
      return res.status(400).json({ message: 'Invalid rowType' });
  }

  return res.json({ movies });
}

async function similar(req, res) {
  const movieId = req.params.id;
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const excludeIds = req.query.excludeIds?.split(",").map(Number) || [];
  
  const cacheKey = `movie:similar:${movieId}:page:${page}`;

  let movies = await getCache(cacheKey);

  if (!movies) {
    movies = await tmdbService.getSimilarMovies({
      movieId,
      page,
      excludeIds,
      limit,
    });

    await setCache(cacheKey, movies, 60 * 60 * 6);
  }

  res.json({
    movies,
    hasMore: movies.length >= limit,
    page,
  });
}

async function personDetail(req, res) {
  const personId = req.params.id;

  const personCacheKey = `person:detail:${personId}`;
  const creditsCacheKey = `person:credits:${personId}`;

  let person = await getCache(personCacheKey);
  let movies = await getCache(creditsCacheKey);

  if (!person) {
    person = await tmdbService.getPersonById(personId);
    await setCache(personCacheKey, person, 60 * 60 * 12); // 12 saat
  }

  if (!movies) {
    movies = await tmdbService.getPersonCredits(personId);
    await setCache(creditsCacheKey, movies, 60 * 60 * 6); // 6 saat
  }

  return res.json({
    person,
    movies,
  });
}

async function getMoviesByGenre(req,res) {
  const page = Number(req.query.page) || 1;
  const genre = req.query.genre;

  const excludeIdsFromQuery = (req.query.excludeIds || "")
    .split(",")
    .filter(Boolean)
    .map(Number);

  let dislikedIds = [];

  if (req.user) {
    dislikedIds = await getDislikedTmdbIds(req.user._id);
  }

  const excludeIds = [...new Set([
    ...excludeIdsFromQuery,
    ...dislikedIds,
  ])];

  const excludeHash = hashIds(excludeIds);

  const cacheKey = `movies:genre=${genre}:page=${page}:exclude=${excludeHash}`;

  // 🟢 1️⃣ CACHE CHECK
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  // 🔵 2️⃣ TMDB FETCH
  const response = await tmdbService.getMoviesByGenre({
    genre,
    page,
    excludeIds,
  });
  // 🟣 3️⃣ CACHE SET (TTL önemli)
  await setCache(cacheKey, response, 60 * 10); // 10 dk

  return res.json(response);
}




module.exports = { trending, detail, search, discover, addFavorite, removeFavorite, addFollowing, removeFollowing, getTrailer, getMoreMovie, similar, personDetail, getMoviesByGenre };
