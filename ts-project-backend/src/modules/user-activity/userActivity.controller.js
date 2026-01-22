const activityService = require('./userActivity.service');
const User = require('../auth/user.model');

async function logView(req, res) {
  const {
    tmdbId,
    mediaType,
    genreIds = [],
    title,
    posterPath,
    voteAverage,
  } = req.body;
  
  if (!tmdbId || !mediaType || !title) {
    return res.status(400).json({
      message: "tmdbId, mediaType and title required",
    });
  }

  // ⚡ Response hemen dönsün
  res.status(201).json({ ok: true });

  // 🧠 Activity log arkada çalışsın
  setImmediate(() => {
    activityService.logActivity({
      userId: req.user._id,
      tmdbId,
      mediaType,
      action: "view",
      meta: {
        genreIds,
        voteAverage,
        title,
        posterPath,
      },
    });
  });
}

async function logDislike(req, res) {
  const { tmdbId, genreIds, voteAverage, mediaType } = req.body;

  if (!tmdbId || !mediaType) {
    return res.status(400).json({
      message: 'tmdbId and mediaType required',
    });
  }

  await activityService.logActivity({
    userId: req.user._id,
    tmdbId,
    action: 'dislike',
    meta: {
      genreIds,
      voteAverage,
    },
    mediaType
  });

  return res.status(201).json({ ok: true });
}

async function likeMovie(req, res) {
  const {
    tmdbId,
    mediaType,
    title,
    posterPath,
    genreIds = [],
    voteAverage,
  } = req.body;

  if (!tmdbId || !mediaType || !title) {
    return res.status(400).json({
      message: "tmdbId, mediaType and title required",
    });
  }

  // 1️⃣ FAVORITES → duplicate ENGELLE (tmdbId + mediaType)
  await User.updateOne(
    {
      _id: req.user._id,
      favorites: {
        $not: {
          $elemMatch: { tmdbId, mediaType },
        },
      },
    },
    {
      $push: {
        favorites: {
          tmdbId,
          mediaType,
          title,
          posterPath: posterPath ?? null,
          addedAt: new Date(),
        },
      },
    }
  );

  // 2️⃣ HEMEN RESPONSE (UX hızlı olsun)
  res.status(201).json({ ok: true });

  // 3️⃣ ACTIVITY LOG → async (kritik değil)
  setImmediate(() => {
    activityService.logActivity({
      userId: req.user._id,
      tmdbId,
      mediaType,
      action: "like",
      meta: { genreIds, voteAverage },
    });
  });
}


async function unlikeMovie(req, res) {

  const { mediaType, tmdbId } = req.body;
  if (!tmdbId || !mediaType) {
    return res.status(400).json({
      message: 'tmdbId and mediaType required',
    });
  }

  // 1️⃣ USER → favorites'ten çıkar
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {
        favorites: {
          tmdbId,
          mediaType,
        },
      },
    },
    { new: true }
  );

  // ❌ activity SİLİNMİYOR (bilinçli karar)

  return res.status(200).json({ ok: true });
}




module.exports = {
  logView,
  logDislike,
  likeMovie,
  unlikeMovie
};
