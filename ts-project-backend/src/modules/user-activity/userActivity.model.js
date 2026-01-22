const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  tmdbId: {
    type: Number,
    required: true,
  },

  mediaType: {
    type: String,
    enum: ['movie', 'tv'],
    required: true,
    index: true,
  },

  action: {
    type: String,
    enum: ['view', 'like', 'dislike', 'follow'],
    required: true,
    index: true,
  },

  meta: {
  genreIds: [Number],
  voteAverage: Number,

  // 🖼 UI için snapshot
  title: String,
  posterPath: String,
},
}, { timestamps: true });

// Aynı kullanıcı aynı filmi arka arkaya spamlemesin
userActivitySchema.index(
  { userId: 1, tmdbId: 1, action: 1, createdAt: -1  },
  { unique: false }
);

module.exports = mongoose.model('UserActivity', userActivitySchema);
