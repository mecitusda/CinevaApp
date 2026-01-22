const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // 🔴 default olarak DB'den gelmez
  },
  avatar: {
    type: String,
    default: null,
  },
 favorites: {
  type: [
    {
      tmdbId: { type: Number, required: true },
      mediaType: { type: String, enum: ["movie", "tv"], required: true },
      title: { type: String, required: true },
      posterPath: { type: String, default: null },
      addedAt: { type: Date, default: Date.now },
    },
  ],
  default: [],
},


  following: {
  type: [
    {
     tmdbId: { type: Number, required: true },
      mediaType: { type: String, enum: ["movie", "tv"], required: true },
      title: { type: String, required: true },
      posterPath: { type: String, default: null },
      addedAt: { type: Date, default: Date.now },
    },
  ],
  default: [],
  },

  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};
userSchema.index(
  { "favorites.tmdbId": 1, "favorites.mediaType": 1 }
);

userSchema.index(
  { "following.tmdbId": 1, "following.mediaType": 1 }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
