const jwt = require('jsonwebtoken');
const User = require('./user.model');

async function login({ email, password }) {
  // 1️⃣ User var mı?
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // 2️⃣ Password doğru mu?
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // 3️⃣ Token üret
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // 4️⃣ Dışarı temiz veri dön
  return {
    user,   // toJSON sayesinde password yok
    token,  // cookie’ye yazılacak
  };
}


async function register({ username, email, password }) {
  // 1) Kullanıcı var mı?
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new Error('Email already in use');
  }

  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    throw new Error('Username already taken');
  }

  // 2) Oluştur (password pre-save hook ile hashlenir)
  const user = await User.create({ username, email, password });

  // 3) Token üret
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { user, token };
}

module.exports = {
  login,
  register,
};
