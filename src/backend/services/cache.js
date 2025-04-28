const Redis = require('ioredis');
const { promisify } = require('util');

class CacheService {
  constructor() {
    this.client = new Redis(process.env.REDIS_URL);
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  async get(key) {
    try {
      const data = await this.getAsync(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      const stringValue = JSON.stringify(value);
      await this.setAsync(key, stringValue, 'EX', ttl);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.delAsync(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async clearPattern(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache clear pattern error:', error);
      return false;
    }
  }
}

module.exports = new CacheService(); 