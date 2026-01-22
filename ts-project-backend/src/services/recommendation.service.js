const UserActivity = require('../modules/user-activity/userActivity.model');
const tmdbService = require('./tmdb.service');
const { getCache, setCache } = require('./cache.service');

const GENRE_LABELS = {
  28: 'Aksiyon',
  12: 'Macera',
  16: 'Animasyon',
  35: 'Komedi',
  80: 'Suç',
  18: 'Drama',
  10751: 'Aile',
  14: 'Fantastik',
  36: 'Tarih',
  27: 'Korku',
  10402: 'Müzik',
  9648: 'Gizem',
  10749: 'Romantik',
  878: 'Bilim Kurgu',
  53: 'Gerilim',
  10752: 'Savaş',
  37: 'Western',
};


async function collectUntilLimit({
  fetchPageFn,
  limit,
  excludeSet,
  seenSet,
  maxPage = 5,
}) {
  let page = 1;
  const collected = [];

  while (collected.length < limit && page <= maxPage) {
    const res = await fetchPageFn(page);

    // ✅ normalize et
    const movies = Array.isArray(res)
      ? res
      : Array.isArray(res?.movies)
        ? res.movies
        : [];

    for (const m of movies) {
      const id = String(m.tmdbId);

      if (!excludeSet.has(id) && !seenSet.has(id)) {
        excludeSet.add(id);
        seenSet.add(id);
        collected.push(m);

        if (collected.length >= limit) break;
      }
    }

    page++;
  }

  return collected;
}

function buildGenreReason(genreId) {
  const label = GENRE_LABELS[genreId];
  if(!label) {
    return null;
  }
  return {
    type: 'genre',
    genreId: Number(genreId),
    text: `${label} türüne ilgi gösterdiğin için`,
  };
}
const WEIGHTS = {
  dislike: -3,
  like: 3,
  watch: 2,
  view: 1,
};

function timeDecayMultiplier(createdAt) {
  const daysAgo = (Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24);

  if (daysAgo <= 7) return 1.5;
  if (daysAgo <= 30) return 1.2;
  return 1.0;
}

async function getDiscoveryMovies() {
  const randomPage = Math.floor(Math.random() * 5) + 1;

  const data = await tmdbService.discoverRandom({
    page: randomPage,
    minVote: 7,
  });

  return data.slice(0, 3);
}

async function getRecommendationsForUser(
  userId,
  { excludeIds = [], limit = 15, mode = 'initial' } = {}
) {
  const cacheKey = `reco:user:${userId}`;

  if (mode === 'initial') {
    const cached = await getCache(cacheKey);
    if (cached) return cached;
  }

  /* ============================
     1️⃣ USER ACTIVITY (ACTION!)
  ============================ */
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90); // 90 gün

  const activities = await UserActivity.find({
    userId,
    createdAt: { $gte: since },
  }).lean();

  const dislikedIdsFromLogs = activities
    .filter(a => a.action === 'dislike')
    .map(a => String(a.tmdbId));

  const excludeSet = new Set([
    ...excludeIds.map(String),
    ...dislikedIdsFromLogs,
  ]);

  const seenFromActivitySet = new Set(
    activities.map(a => String(a.tmdbId))
  );

  /* ============================
     🧊 COLD START
  ============================ */
  if (activities.length === 0) {
    const trendingRes = await tmdbService.getTrending({ page: 1 });

    const filtered = trendingRes.movies.filter(
      m => !excludeSet.has(String(m.tmdbId))
    );

    const hero = mode === 'initial' ? filtered[0] || null : null;
    const movies =
      mode === 'initial'
        ? filtered.slice(1, limit + 1)
        : filtered.slice(0, limit);

    const result =
      mode === 'initial'
        ? { hero, recommended: { movies, reason: null } }
        : movies;

    if (mode === 'initial') {
      await setCache(cacheKey, result, 600);
    }

    return result;
  }

  /* ============================
     2️⃣ GENRE SCORE (ACTION!)
  ============================ */
  const genreScores = {};

  for (const act of activities) {
    const baseWeight = WEIGHTS[act.action] || 1;
    const decay = timeDecayMultiplier(act.createdAt);
    const weight = baseWeight * decay;

    for (const gid of act.meta?.genreIds || []) {
      genreScores[gid] = (genreScores[gid] || 0) + weight;
    }
  }

  const topGenres = Object.entries(genreScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([gid]) => gid);

  const seenDuringCollectionSet = new Set();

  /* ============================
     3️⃣ INITIAL MODE
  ============================ */
  if (mode === 'initial') {
    let merged = [];

    for (const gid of topGenres) {
      const movies = await collectUntilLimit({
        fetchPageFn: page =>
          tmdbService.discoverByGenre(gid, { page }),
        limit: limit + 1,
        excludeSet,
        seenSet: new Set([...seenFromActivitySet, ...seenDuringCollectionSet]),
      });

      for (const m of movies) {
        const id = String(m.tmdbId);
        if (!seenDuringCollectionSet.has(id)) {
          seenDuringCollectionSet.add(id);
          merged.push(m);
        }
      }

      if (merged.length >= limit + 1) break;
    }

    const hero = merged[0] || null;
    const movies = merged.slice(1, limit + 1);
    const reason = buildGenreReason(topGenres[0]);

    const result = { hero, recommended: { movies, reason } };
    await setCache(cacheKey, result, 600);
    return result;
  }

  /* ============================
     4️⃣ REFILL MODE
  ============================ */
  let collected = [];

  for (const gid of topGenres) {
    const movies = await collectUntilLimit({
      fetchPageFn: page =>
        tmdbService.discoverByGenre(gid, { page }),
      limit,
      excludeSet,
      seenSet: new Set([...seenFromActivitySet, ...seenDuringCollectionSet]),
    });

    for (const m of movies) {
      const id = String(m.tmdbId);
      if (!seenDuringCollectionSet.has(id)) {
        seenDuringCollectionSet.add(id);
        collected.push(m);
      }
    }

    if (collected.length >= limit) break;
  }

  if (collected.length < limit) {
    const movies = await collectUntilLimit({
      fetchPageFn: page => tmdbService.discoverRandom({ page }),
      limit: limit - collected.length,
      excludeSet,
      seenSet: seenDuringCollectionSet,
    });
    collected.push(...movies);
  }

  if (collected.length < limit) {
    const movies = await collectUntilLimit({
      fetchPageFn: page => tmdbService.getTrending({ page }),
      limit: limit - collected.length,
      excludeSet,
      seenSet: seenDuringCollectionSet,
    });
    collected.push(...movies);
  }

  return collected.slice(0, limit);
}








module.exports = {
  getRecommendationsForUser,
};
