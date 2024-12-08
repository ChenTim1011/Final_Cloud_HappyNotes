// src/backend/services/cacheService.js
const redisClient = require("../config/redis");

class CacheService {
  static WHITEBOARD_PREFIX = "wb:";
  static CARD_PREFIX = "card:";
  static DEFAULT_TTL = 3600; // 1 hour

  // Card methods
  static async getCard(cardId) {
    const cacheKey = `${this.CARD_PREFIX}${cardId}`;
    const cachedData = await redisClient.get(cacheKey);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  static async setCard(cardId, data) {
    const cacheKey = `${this.CARD_PREFIX}${cardId}`;
    await redisClient.set(
      cacheKey,
      JSON.stringify(data),
      "EX",
      this.DEFAULT_TTL
    );
  }

  static async invalidateCard(cardId) {
    const cacheKey = `${this.CARD_PREFIX}${cardId}`;
    await redisClient.del(cacheKey);
  }

  static async getAllCards() {
    const cacheKey = `${this.CARD_PREFIX}all`;
    const cachedData = await redisClient.get(cacheKey);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  static async setAllCards(cards) {
    const cacheKey = `${this.CARD_PREFIX}all`;
    await redisClient.set(
      cacheKey,
      JSON.stringify(cards),
      "EX",
      this.DEFAULT_TTL
    );
  }

  static async invalidateAllCards() {
    const cacheKey = `${this.CARD_PREFIX}all`;
    await redisClient.del(cacheKey);
  }

  // Whiteboard methods
  static async getWhiteboard(whiteboardId) {
    const cacheKey = `${this.WHITEBOARD_PREFIX}${whiteboardId}`;
    const cachedData = await redisClient.get(cacheKey);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  static async setWhiteboard(whiteboardId, data) {
    const cacheKey = `${this.WHITEBOARD_PREFIX}${whiteboardId}`;
    await redisClient.set(
      cacheKey,
      JSON.stringify(data),
      "EX",
      this.DEFAULT_TTL
    );
  }

  static async invalidateWhiteboard(whiteboardId) {
    const cacheKey = `${this.WHITEBOARD_PREFIX}${whiteboardId}`;
    await redisClient.del(cacheKey);
  }

  static async getAllWhiteboards() {
    const cacheKey = `${this.WHITEBOARD_PREFIX}all`;
    const cachedData = await redisClient.get(cacheKey);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  static async setAllWhiteboards(whiteboards) {
    const cacheKey = `${this.WHITEBOARD_PREFIX}all`;
    await redisClient.set(
      cacheKey,
      JSON.stringify(whiteboards),
      "EX",
      this.DEFAULT_TTL
    );
  }

  static async invalidateAllWhiteboards() {
    const cacheKey = `${this.WHITEBOARD_PREFIX}all`;
    await redisClient.del(cacheKey);
  }

  // Utility methods
  static async clearAllCache() {
    await redisClient.flushall();
  }

  static async getKeyTTL(key) {
    return await redisClient.ttl(key);
  }

  static async updateTTL(key, newTTL = this.DEFAULT_TTL) {
    await redisClient.expire(key, newTTL);
  }
}

module.exports = CacheService;
