const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

// Redis client configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('The Redis server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    // Reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
};

// Create Redis client
let client;

// Initialize Redis connection
const initializeRedis = async () => {
  try {
    client = redis.createClient(redisConfig);
    
    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
    
    client.on('connect', () => {
      console.log('✅ Redis client connected successfully');
    });
    
    client.on('ready', () => {
      console.log('✅ Redis client ready to accept commands');
    });
    
    client.on('end', () => {
      console.log('Redis client connection closed');
    });
    
    await client.connect();
    
    // Test connection
    await client.ping();
    console.log('✅ Redis ping successful');
    
    return client;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
};

// Get Redis client
const getRedisClient = () => {
  if (!client) {
    throw new Error('Redis client not initialized. Call initializeRedis() first.');
  }
  return client;
};

// Redis utilities
const redisClient = {
  // String operations
  async set(key, value, expiryInSeconds = null) {
    const client = getRedisClient();
    if (expiryInSeconds) {
      await client.setEx(key, expiryInSeconds, value);
    } else {
      await client.set(key, value);
    }
  },
  
  async get(key) {
    const client = getRedisClient();
    return await client.get(key);
  },
  
  async del(key) {
    const client = getRedisClient();
    return await client.del(key);
  },
  
  async exists(key) {
    const client = getRedisClient();
    return await client.exists(key);
  },
  
  // Hash operations
  async hSet(key, field, value) {
    const client = getRedisClient();
    return await client.hSet(key, field, value);
  },
  
  async hGet(key, field) {
    const client = getRedisClient();
    return await client.hGet(key, field);
  },
  
  async hGetAll(key) {
    const client = getRedisClient();
    return await client.hGetAll(key);
  },
  
  // List operations
  async lPush(key, value) {
    const client = getRedisClient();
    return await client.lPush(key, value);
  },
  
  async rPop(key) {
    const client = getRedisClient();
    return await client.rPop(key);
  },
  
  async lRange(key, start = 0, stop = -1) {
    const client = getRedisClient();
    return await client.lRange(key, start, stop);
  },
  
  // Set operations
  async sAdd(key, value) {
    const client = getRedisClient();
    return await client.sAdd(key, value);
  },
  
  async sMembers(key) {
    const client = getRedisClient();
    return await client.sMembers(key);
  },
  
  // Cache operations with TTL
  async cacheSet(key, data, ttlSeconds = 3600) {
    const client = getRedisClient();
    const serializedData = JSON.stringify(data);
    await client.setEx(key, ttlSeconds, serializedData);
  },
  
  async cacheGet(key) {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  },
  
  // Session management
  async setSession(sessionId, userData, ttlSeconds = 86400) {
    const client = getRedisClient();
    await client.setEx(`session:${sessionId}`, ttlSeconds, JSON.stringify(userData));
  },
  
  async getSession(sessionId) {
    const client = getRedisClient();
    const data = await client.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  },
  
  async deleteSession(sessionId) {
    const client = getRedisClient();
    return await client.del(`session:${sessionId}`);
  },
  
  // Rate limiting
  async checkRateLimit(key, limit, windowSeconds) {
    const client = getRedisClient();
    const current = await client.incr(key);
    
    if (current === 1) {
      await client.expire(key, windowSeconds);
    }
    
    return {
      current,
      limit,
      remaining: Math.max(0, limit - current),
      reset: current === 1 ? Date.now() + (windowSeconds * 1000) : null
    };
  },
  
  // Notification queue
  async addNotification(notification) {
    const client = getRedisClient();
    const notificationData = JSON.stringify(notification);
    await client.lPush('notifications', notificationData);
  },
  
  async getNotifications(limit = 10) {
    const client = getRedisClient();
    const notifications = await client.lRange('notifications', 0, limit - 1);
    return notifications.map(n => JSON.parse(n));
  },
  
  async clearNotifications() {
    const client = getRedisClient();
    return await client.del('notifications');
  },
  
  // Cleanup expired sessions and cache
  async cleanup() {
    const client = getRedisClient();
    // Clean up expired sessions
    const sessionKeys = await client.keys('session:*');
    if (sessionKeys.length > 0) {
      await client.del(sessionKeys);
    }
    
    // Clean up rate limiters
    const rateLimitKeys = await client.keys('rate_limit:*');
    if (rateLimitKeys.length > 0) {
      await client.del(rateLimitKeys);
    }
    
    console.log('✅ Redis cleanup completed');
  }
};

// Graceful shutdown
const closeRedis = async () => {
  if (client) {
    await client.quit();
    console.log('✅ Redis connection closed gracefully');
  }
};

module.exports = {
  initializeRedis,
  getRedisClient,
  redisClient,
  closeRedis
};