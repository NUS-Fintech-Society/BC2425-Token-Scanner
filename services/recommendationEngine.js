// services/recommendationEngine.js
class RecommendationEngine {
    constructor(tokenScanner, apiService) {
        this.tokenScanner = tokenScanner;
        this.apiService = apiService;
    }

    async generateRecommendations(filters = {}) {
        const tokens = await Token.find({
            marketCap: { $gt: filters.minMarketCap || 0 },
            holders: { $gt: config.MIN_HOLDER_THRESHOLD }
        }).sort({ memeScore: -1 });

        const scored = await Promise.all(tokens.map(async token => {
            const score = await this.calculateScore(token);
            return { token, score };
        }));

        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }

    async calculateScore(token) {
        const weights = {
            memeScore: 0.2,
            volumeGrowth: 0.2,
            holderGrowth: 0.15,
            deployerTrust: 0.15,
            burnRate: 0.1,
            dexPaid: 0.1,
            priceAction: 0.1
        };

        // Calculate individual scores
        const volumeGrowth = await this.calculateVolumeGrowth(token);
        const holderGrowth = await this.calculateHolderGrowth(token);
        const deployerTrust = token.deployer.isWhitelisted ? 1 : 0;
        const burnRate = await this.calculateBurnRate(token);
        const priceAction = token.price / token.priceATH;

        return (
            token.memeScore * weights.memeScore +
            volumeGrowth * weights.volumeGrowth +
            holderGrowth * weights.holderGrowth +
            deployerTrust * weights.deployerTrust +
            burnRate * weights.burnRate +
            (token.dexPaid ? 1 : 0) * weights.dexPaid +
            priceAction * weights.priceAction
        );
    }
}
