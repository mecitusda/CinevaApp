const UserActivity = require('./userActivity.model');
const { delCache } = require('../../services/cache.service');

async function logActivity({
  userId,
  tmdbId,
  mediaType,
  action,
  meta = {},
}) {
  // 👁 VIEW → cooldown
  if (action === 'view') {
    const since = new Date(Date.now() - 1000 * 60 * 10); // 10 dk
    const recent = await UserActivity.findOne({
      userId,
      tmdbId,
      mediaType,
      action: 'view',
      createdAt: { $gte: since },
    });
    if (recent) return null;
  }

  // 👍👎 LIKE / DISLIKE / FOLLOW → UPSERT
  if (['like', 'dislike', 'follow'].includes(action)) {
    return UserActivity.findOneAndUpdate(
      { userId, tmdbId, mediaType },
      {
        action,
        meta,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  // VIEW default create
  const activity = await UserActivity.create({
    userId,
    tmdbId,
    mediaType,
    action,
    meta,
  });

  await delCache(`reco:user:${userId}`);
  return activity;
}



module.exports = {
  logActivity,
};
