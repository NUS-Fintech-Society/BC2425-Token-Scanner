// services/filterManager.js
class FilterManager {
    constructor() {
        this.redis = require('../utils/redis');
    }

    async setFilters(userId, filters) {
        try {
            const filterKey = `filters:${userId}`;
            const serializedFilters = JSON.stringify(filters);
            await this.redis.hset(filterKey, 'filters', serializedFilters);
            await this.redis.expire(filterKey, 86400); // 24 hours expiry
        } catch (error) {
            console.error('Error setting filters:', error);
            throw error;
        }
    }

    async getFilters(userId) {
        try {
            const filterKey = `filters:${userId}`;
            const filters = await this.redis.hget(filterKey, 'filters');
            return filters ? JSON.parse(filters) : {};
        } catch (error) {
            console.error('Error getting filters:', error);
            return {};
        }
    }

    async applyFilters(tokens, filters) {
        try {
            return tokens.filter(token => {
                return (
                    this.checkHolderFilter(token, filters) &&
                    this.checkLiquidityFilter(token, filters) &&
                    this.checkMarketCapFilter(token, filters) &&
                    this.checkCTOFilter(token, filters) &&
                    this.checkVerificationFilter(token, filters)
                );
            });
        } catch (error) {
            console.error('Error applying filters:', error);
            return tokens;
        }
    }

    checkHolderFilter(token, filters) {
        return !filters.minHolders || token.holders >= filters.minHolders;
    }

    checkLiquidityFilter(token, filters) {
        return !filters.minLiquidity || token.liquidity >= filters.minLiquidity;
    }

    checkMarketCapFilter(token, filters) {
        return !filters.minMarketCap || token.marketCap >= filters.minMarketCap;
    }

    checkCTOFilter(token, filters) {
        return !filters.excludeCTO || !token.isCTO;
    }

    checkVerificationFilter(token, filters) {
        return !filters.onlyVerified || token.isVerified;
    }
}

module.exports = FilterManager;