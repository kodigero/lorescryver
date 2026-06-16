/**
 * Redis client — singleton for rate limiting, sessions, and caching.
 * Uses ioredis for robust Redis connectivity.
 */
import Redis from 'ioredis';

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    // Don't throw on connection errors during startup
    lazyConnect: false,
  });

  client.on('error', (err: Error) => {
    console.error('Redis connection error:', err.message);
  });

  return client;
}

// Singleton pattern (same as Prisma client)
const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

export const redis: Redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
