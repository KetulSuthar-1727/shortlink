const redisClient = require('../src/redis/client');

const LIMIT = 5;
const WINDOW = 60;

async function checkRateLimit(key) {
  try {
    const currentCount = await redisClient.incr(key);

    // only setting expiry when first time the request is coming
    if (currentCount === 1) {
      await redisClient.expire(key, WINDOW);
    }

    const ttl = await redisClient.ttl(key);

    return {
      allowed: currentCount <= LIMIT,
      count: currentCount,
      limit: LIMIT,
      remaining: Math.max(0, LIMIT - currentCount),
      resetIn: ttl,
    };
  } catch (error) {
    console.log('Redis rate limiter error: ', error);

    return {
      allowed: true,
      count: 0,
      limit: LIMIT,
      remaining: LIMIT,
      resetIn: 0,
    };
  }
}

module.exports = {
  checkRateLimit,
};
