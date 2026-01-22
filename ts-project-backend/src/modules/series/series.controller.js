const tmdbService = require('../../services/tmdb.service');
const UserActivity = require('../user-activity/userActivity.model');
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

async function getSeries(req, res) {


  const page = Number(req.query.page) || 1;
  const genre = req.query.genre;
  const excludeIdsFromQuery = (req.query.excludeIds || "")
    .split(",")
    .filter(Boolean)
    .map(Number);

  let dislikedIds = [];

  // 🟢 kullanıcı varsa diziler için dislike logları çek
  try{
  if (req.user) {
    dislikedIds = await getDislikedTmdbIds(req.user._id, "tv");
    // ⬆️ burada activity tablosunda action: "tv" filtresi öneririm
  }

  const excludeIds = [
    ...new Set([...excludeIdsFromQuery, ...dislikedIds]),
  ];

  const excludeHash = hashIds(excludeIds);

  const cacheKey = `series:genre=${genre}:page=${page}:exclude=${excludeHash}`;

  // 🟢 CACHE CHECK
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  // 🔵 TMDB FETCH
  const response = await tmdbService.getSeriesByGenre({
    genre,
    page,
    excludeIds,
  })
  // 🟣 CACHE SET
  await setCache(cacheKey, response, 60 * 10);

  return res.json(response);
  }catch(err){
    return res.json(err.message)
  }
}

async function detail(req, res) {
  const seriesId = req.params.id;
  const seriesCacheKey = `series:detail:${seriesId}`;
  const castCacheKey = `series:cast:${seriesId}`;
  const creatorsCacheKey = `series:creators:${seriesId}`;
  try{
  // 📺 SERIES
  let series = await getCache(seriesCacheKey);
  if (!series) {
    series = await tmdbService.getSeriesById(seriesId);
    await setCache(seriesCacheKey, series, 60 * 60 * 6); // 6 saat
  }

  // 🎭 CAST
  let cast = await getCache(castCacheKey);

  if (!cast) {
    cast = await tmdbService.getSeriesCast(seriesId);
    await setCache(castCacheKey, cast, 60 * 60 * 2); // 2 saat
  }
  // 🎬 CREATORS (director karşılığı)
  let creators = await getCache(creatorsCacheKey);

  if (!creators) {
    creators = series.creators ?? [];
    await setCache(creatorsCacheKey, creators, 60 * 60 * 2);
  }
  // 🔥 SIDE EFFECT → HER ZAMAN
  if (req.user) {
    await activityService.logActivity({
      userId: req.user._id,
      tmdbId: series.tmdbId,
      action: 'view',
      meta: {
        genreIds: series.genres.map(g => g.id),
        voteAverage: series.voteAverage,
        mediaType: "tv",
      },
    });
  }

  return res.json({
    series,
    cast,
    creators,
  });
  }
  catch(err){
    res.json(err.message)
  }
}

async function similar(req, res) {
  const { id } = req.params;
  const page = Number(req.query.page) || 1;

  const cacheKey = `series:similar:${id}:page=${page}`;
  try{
  let data = await getCache(cacheKey);

  if (!data) {
    data = await tmdbService.getSimilarSeries({
      seriesId: id,
      page,
    });

    await setCache(cacheKey, data, 60 * 60 * 6); // 6 saat
  }

  return res.json(data);
  }
  catch(err){
    res.json(err.message)
  }
}

async function trailer(req, res) {
  const seriesId = req.params.id;
  console.log("trailer series")
  const cacheKey = `series:trailer:${seriesId}`;
  try{
    console.log("1")
  let trailer = await getCache(cacheKey);

  if (!trailer) {
    trailer = await tmdbService.getSeriesTrailer(seriesId);
    console.log("2")
    // null da cache’le → TMDB’ye abanma
    await setCache(cacheKey, trailer, 60 * 60 * 6); // 6 saat
  }

  return res.json(trailer);
  }
  catch(err){
    res.json(err.message)
  }

}

module.exports = { getSeries, detail, similar, trailer };