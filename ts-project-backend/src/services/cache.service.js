  const { redisClient } = require('./redis');

  async function getCache(key) {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  async function setCache(key, value, ttl = 300) {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  }

  async function delCache(key) {
    await redisClient.del(key);
  }

  async function clearAllRecommendationCache() {
  const keys = await redisClient.keys('reco:user:*');

  if (keys.length === 0) return 0;

  await redisClient.del(keys);
  return keys.length;
  }
  
  

  module.exports = {
    getCache,
    setCache,
    delCache
  };
