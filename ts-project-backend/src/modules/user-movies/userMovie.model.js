const mongoose = require('mongoose');

const userMovieSchema = new mongoose.Schema(
  {
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

    status: {
      type: String,
      enum: ['watching', 'watched'],
      default: 'watching',
    },

    favorite: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      min: 1,
      max: 10,
    },
  },
  { timestamps: true }
);

// Aynı kullanıcı aynı filmi 1 kez ekleyebilir
userMovieSchema.index({ userId: 1, tmdbId: 1 }, { unique: true });

module.exports = mongoose.model('UserMovie', userMovieSchema);
