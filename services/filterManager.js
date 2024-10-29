// Add services/FilterManager.js
class FilterManager {
    constructor() {
        this.redis = require('../utils/redis');
    }

    async setFilters(userId, filters) {
        await this.redis.hset(`filters:${userId}`, filters);
    }

    async getFilters(userId) {
        return await this.redis.hgetall(`filters:${userId}`);
    }

    async applyFilters(tokens, filters) {
        return tokens.filter(token => {
            return (
                (!filters.minHolders || token.holders >= filters.minHolders) &&
                (!filters.minLiquidity || token.liquidity >= filters.minLiquidity) &&
                (!filters.minMarketCap || token.marketCap >= filters.minMarketCap) &&
                (!filters.excludeCTO || !token.isCTO) &&
                (!filters.onlyVerified || token.isVerified)
            );
        });
    }
}