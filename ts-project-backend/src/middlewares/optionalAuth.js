const jwt = require('jsonwebtoken');
const User = require('../modules/auth/user.model');

async function optionalAuth(req, res, next) {
  const token = req.cookies?.auth_token;

  // Login değilse → sessiz geç
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    req.user = user || null;
    return next();
  } catch (err) {
    // Token bozuksa bile home'u bozma
    req.user = null;
    return next();
  }
}

module.exports = optionalAuth;
