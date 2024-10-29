// services/recommendationEngine.js
class RecommendationEngine {
    constructor(tokenScanner, apiService) {
        this.tokenScanner = tokenScanner;
        this.apiService = apiService;
    }

    async calculateVolumeGrowth(token) {
        try {
            const volumeHistory = await this.apiService.getVolumeHistory(token.address);
            return this.calculateGrowthRate(volumeHistory);
        } catch (error) {
            console.error('Error calculating volume growth:', error);
            return 0;
        }
    }

    async calculateHolderGrowth(token) {
        try {
            const holderHistory = await this.apiService.getHolderHistory(token.address);
            return this.calculateGrowthRate(holderHistory);
        } catch (error) {
            console.error('Error calculating holder growth:', error);
            return 0;
        }
    }

    async calculateBurnRate(token) {
        try {
            const burnEvents = await this.apiService.getBurnEvents(token.address);
            return this.calculateBurnMetrics(burnEvents);
        } catch (error) {
            console.error('Error calculating burn rate:', error);
            return 0;
        }
    }

    calculateGrowthRate(history) {
        if (!history || history.length < 2) return 0;
        const oldest = history[0];
        const newest = history[history.length - 1];
        return (newest.value - oldest.value) / oldest.value;
    }
}

module.exports = RecommendationEngine;