const UserMovie = require('../user-movies/userMovie.model');
const UserActivity = require('../user-activity/userActivity.model');
const User = require('../auth/user.model');
const { getSignedAvatarUrl } = require('../../config/s3');
async function getProfileStats(req, res) {
  const userId = req.user._id;

  // 1️⃣ İzlenen film sayısı
  const watchedCount = await UserMovie.countDocuments({
    userId,
    status: 'watched',
  });

  // 2️⃣ Favoriler
  const favoriteCount = await UserMovie.countDocuments({
    userId,
    favorite: true,
  });

  // 3️⃣ Ortalama rating
  const ratings = await UserMovie.find({
    userId,
    rating: { $exists: true },
  }).select('rating');

  const avgRating =
    ratings.length === 0
      ? null
      : (
          ratings.reduce((a, b) => a + b.rating, 0) / ratings.length
        ).toFixed(1);

  // 4️⃣ En sevilen türler
  const activities = await UserActivity.find({ userId });

  const genreScores = {};
  for (const act of activities) {
    const genres = act.meta?.genreIds || [];
    for (const gid of genres) {
      genreScores[gid] = (genreScores[gid] || 0) + 1;
    }
  }

  const topGenres = Object.entries(genreScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([gid, count]) => ({ genreId: Number(gid), count }));

  return res.json({
    watchedCount,
    favoriteCount,
    avgRating,
    topGenres,
  });
}

async function uploadAvatar(req, res) {
  if (!req.file || !req.file.location) {
    return res.status(400).json({ message: 'Avatar upload failed' });
  }

  const avatarKey = req.file.key;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatarKey },
    { new: true }
  );

  const signedUrl = await getSignedAvatarUrl(avatarKey);

  res.json({
    avatar: signedUrl,
  });
}


module.exports = { getProfileStats, uploadAvatar };
