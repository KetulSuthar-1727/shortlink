const redisClient = require("../src/redis/client");

const LIMIT = 5;
const WINDOW = 60;

async function checkRateLimit(key) {
  const currentCount = await redisClient.incr(key);

  // only setting expiry when first time the request is coming
  if (currentCount === 1) {
    await redisClient.expire(key, WINDOW);
  }

  return {
    allowed: currentCount <= LIMIT,
    count: currentCount,
    limit: LIMIT,
  };
}

module.exports = {
  checkRateLimit,
};