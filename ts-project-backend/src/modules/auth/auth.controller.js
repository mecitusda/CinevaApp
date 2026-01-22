const authService = require('./auth.service');
const { getSignedAvatarUrl } = require('../../config/s3');
const User = require("../auth/user.model");
const UserActivity = require("../user-activity/userActivity.model");

async function me(req, res) {
  // authMiddleware sayesinde req.user var
  let userData = req.user;
  
  // Avatar varsa signed URL oluştur
  if (userData.avatar) {
    const signedUrl = await getSignedAvatarUrl(userData.avatar);
    userData = { ...userData.toObject ? userData.toObject() : userData, avatar: signedUrl };
  }

  return res.status(200).json({
    user: userData,
  });
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Basit input kontrolü (detayı sonra genişletiriz)
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    // Service çağrısı
    let { user, token } = await authService.login({ email, password });

    // Avatar varsa signed URL oluştur
    if (user.avatar) {
      const signedUrl = await getSignedAvatarUrl(user.avatar);
      user = { ...user.toObject ? user.toObject() : user, avatar: signedUrl };
    }

    // 🔐 HttpOnly cookie set
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    });

    // Frontend'e sadece user dön
    return res.status(200).json({
      user,
    });
  } catch (error) {
    return res.status(401).json({
      message: error.message || 'Login failed',
    });
  }
}

async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required' });
    }

    let { user, token } = await authService.register({ username, email, password });

    // Avatar varsa signed URL oluştur
    if (user.avatar) {
      const signedUrl = await getSignedAvatarUrl(user.avatar);
      user = { ...user.toObject ? user.toObject() : user, avatar: signedUrl };
    }

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ user });
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Register failed' });
  }
}

async function logout(req, res) {
  res.clearCookie('auth_token');
  return res.status(200).json({
    message: 'Logged out successfully',
  });
}

async function mylist(req, res) {
  const userId = req.user._id;

  /* =========================
     1️⃣ USER DATA
  ========================= */
  const user = await User.findById(userId)
    .select("favorites following")
    .lean();

  /* =========================
     2️⃣ RECENTLY VIEWED
     - son 20 view
     - duplicate tmdbId temizlenir
  ========================= */
  const views = await UserActivity.find({
    userId,
    action: "view",
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const seen = new Set();
  const recentlyViewed = [];

  for (const v of views) {
    const key = `${v.tmdbId}-${v.mediaType}`;
    if (seen.has(key)) continue;

    seen.add(key);
    recentlyViewed.push({
      tmdbId: v.tmdbId,
      mediaType: v.mediaType,
      viewedAt: v.createdAt,
      posterPath: v.meta?.posterPath ?? null,
      title: v.meta?.title ?? null,
    });

    if (recentlyViewed.length >= 20) break;
  }

  /* =========================
     3️⃣ RESPONSE
  ========================= */
  res.json({
    recentlyViewed,
    favorites: user.favorites ?? [],
    following: user.following ?? [],
  });
}


module.exports = {
  login,
  register,
  logout,
  me,
  mylist
};
