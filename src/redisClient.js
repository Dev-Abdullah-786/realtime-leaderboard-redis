const Redis = require("ioredis");

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = Number.parseInt(process.env.REDIS_PORT, 10) || 6379;

const redisClient = new Redis({
  host: redisHost,
  port: redisPort,
  lazyConnect: true,
  retryStrategy(retryCount) {
    if (retryCount > 5) {
      console.error("Redis connection failed after 5 retries.");
      console.error("Make sure your Redis server is running.");
      return null;
    }

    return Math.min(retryCount * 300, 3000);
  },
});

redisClient.on("connect", () => {
  console.log(`Redis connected at ${redisHost}:${redisPort}`);
});

redisClient.on("error", (error) => {
  console.error("Redis error:", error.message);
});

module.exports = redisClient;
