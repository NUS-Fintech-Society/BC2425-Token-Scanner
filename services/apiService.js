// services/apiService.js
const axios = require('axios');
const rateLimit = require('axios-rate-limit');
const redis = require('../utils/redis');
const config = require('../config');

class ApiService {
    constructor() {
        // Create rate-limited axios instance for pump.fun API
        this.pumpApi = rateLimit(axios.create({
            baseURL: config.PUMP_FUN_API,
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Token-Scanner-Bot/1.0'
            }
        }), { 
            maxRequests: 30,
            perMilliseconds: 60000 
        });

        // Create rate-limited axios instance for Dexscreener API
        this.dexscreenerApi = rateLimit(axios.create({
            baseURL: config.DEXSCREENER_API,
            timeout: 10000
        }), {
            maxRequests: 20,
            perMilliseconds: 60000
        });

        // Cache TTL settings
        this.cacheTTL = {
            tokens: 60,
            trades: 30,
            replies: 300,
            price: 60,
            dexscreener: 300
        };
    }

    async getLatestTokens() {
        const cacheKey = 'latest_tokens';
        try {
            // Check cache first
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }

            // Fetch from API if not cached
            const response = await this.pumpApi.get('/coins/latest');
            const tokens = response.data;

            // Cache the response
            await redis.setex(cacheKey, this.cacheTTL.tokens, JSON.stringify(tokens));
            return tokens;
        } catch (error) {
            console.error('Error fetching latest tokens:', error);
            return [];
        }
    }

    async getLatestTrades() {
        const cacheKey = 'latest_trades';
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }

            const response = await this.pumpApi.get('/trades/latest');
            const trades = response.data;

            await redis.setex(cacheKey, this.cacheTTL.trades, JSON.stringify(trades));
            return trades;
        } catch (error) {
            console.error('Error fetching latest trades:', error);
            return [];
        }
    }

    async getTokenReplies(tokenAddress, limit = 100, offset = 0) {
        const cacheKey = `replies:${tokenAddress}:${limit}:${offset}`;
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }

            const response = await this.pumpApi.get('/replies', {
                params: { limit, offset, tokenAddress }
            });
            const replies = response.data;

            await redis.setex(cacheKey, this.cacheTTL.replies, JSON.stringify(replies));
            return replies;
        } catch (error) {
            console.error('Error fetching token replies:', error);
            return [];
        }
    }

    async getSolPrice() {
        const cacheKey = 'sol_price';
        try {
            const cachedPrice = await redis.get(cacheKey);
            if (cachedPrice) {
                return parseFloat(cachedPrice);
            }

            const response = await this.pumpApi.get('/sol-price');
            const price = response.data;

            await redis.setex(cacheKey, this.cacheTTL.price, price.toString());
            return price;
        } catch (error) {
            console.error('Error fetching SOL price:', error);
            return null;
        }
    }

    async checkDexscreenerAds(tokenAddress) {
        const cacheKey = `dexscreener:${tokenAddress}`;
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }

            const response = await this.dexscreenerApi.get(`/${tokenAddress}`);
            const data = response.data;

            await redis.setex(cacheKey, this.cacheTTL.dexscreener, JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error checking Dexscreener ads:', error);
            return null;
        }
    }

    async getUserCreatedTokens(userId, limit = 100, offset = 0) {
        const cacheKey = `user_tokens:${userId}:${limit}:${offset}`;
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }

            const response = await this.pumpApi.get(`/coins/user-created-coins/${userId}`, {
                params: {
                    limit,
                    offset,
                    includeNsfw: true
                }
            });
            const tokens = response.data;

            await redis.setex(cacheKey, this.cacheTTL.tokens, JSON.stringify(tokens));
            return tokens;
        } catch (error) {
            console.error('Error fetching user created tokens:', error);
            return [];
        }
    }

    async clearCache() {
        try {
            await redis.flushall();
            console.log('API cache cleared successfully');
        } catch (error) {
            console.error('Error clearing API cache:', error);
        }
    }
}

module.exports = ApiService;