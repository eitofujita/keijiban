import Redis from 'ioredis';
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

export async function initializeRedis() {
  try {
    // Test Redis connection
    await redis.ping();
    console.log('Redis connected successfully');
    
    // Set up any initial Redis data if needed
    await redis.set('server:startup', new Date().toISOString());
    
    return redis;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
}

export { redis };
