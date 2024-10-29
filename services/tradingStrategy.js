// Add to services/tradingStrategy.js
class TradingStrategyAdvisor {
    constructor(tokenScanner, socialAnalyzer) {
        this.tokenScanner = tokenScanner;
        this.socialAnalyzer = socialAnalyzer;
    }

    async generateStrategy(token) {
        const [
            technicalAnalysis,
            socialSentiment,
            onChainMetrics,
            whaleActivity
        ] = await Promise.all([
            this.analyzeTechnicals(token),
            this.socialAnalyzer.analyzeSentiment(token),
            this.analyzeOnChainMetrics(token),
            this.analyzeWhaleActivity(token)
        ]);

        return {
            recommendation: this.generateRecommendation({
                technicalAnalysis,
                socialSentiment,
                onChainMetrics,
                whaleActivity
            }),
            metrics: {
                technical: technicalAnalysis,
                sentiment: socialSentiment,
                onChain: onChainMetrics,
                whales: whaleActivity
            },
            riskLevel: this.calculateRiskLevel(token),
            entryPoints: this.calculateEntryPoints(token),
            exitStrategy: this.generateExitStrategy(token)
        };
    }

    async analyzeTechnicals(token) {
        const priceData = await this.getPriceHistory(token);
        return {
            rsi: this.calculateRSI(priceData),
            macd: this.calculateMACD(priceData),
            support: this.findSupportLevels(priceData),
            resistance: this.findResistanceLevels(priceData),
            volumeProfile: this.analyzeVolumeProfile(priceData)
        };
    }

    async analyzeOnChainMetrics(token) {
        return {
            holderDistribution: await this.getHolderDistribution(token),
            liquidityDepth: await this.analyzeLiquidityDepth(token),
            buyPressure: await this.analyzeBuyPressure(token),
            sellPressure: await this.analyzeSellPressure(token)
        };
    }

    generateExitStrategy(token) {
        return {
            stopLoss: this.calculateStopLoss(token),
            takeProfitLevels: this.calculateTakeProfitLevels(token),
            trailingStop: this.calculateTrailingStop(token)
        };
    }
}