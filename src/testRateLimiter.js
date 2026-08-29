const redisClient = require("../src/redis/client");
const { checkRateLimit } = require("../services/rateLimiter");

async function test() {
  await redisClient.connect();

  const key = "ratelimit:test";

  for (let i = 1; i <= 7; i++) {
    const result = await checkRateLimit(key);

    console.log(`Request ${i}:`, result);
  }

  await redisClient.quit();
}

test();