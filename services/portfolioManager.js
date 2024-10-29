// Add services/portfolioManager.js
class PortfolioManager {
    constructor() {
        this.Portfolio = require('../models/Portfolio');
    }

    async updatePortfolio(userId, holdings) {
        const portfolio = await this.Portfolio.findOne({ userId });
        if (!portfolio) {
            return await this.createPortfolio(userId, holdings);
        }

        const updatedMetrics = await this.calculatePortfolioMetrics(holdings);
        
        return await this.Portfolio.findOneAndUpdate(
            { userId },
            {
                holdings,
                performance: updatedMetrics.performance,
                riskMetrics: updatedMetrics.risk,
                lastUpdated: Date.now()
            },
            { new: true }
        );
    }

    async calculatePortfolioMetrics(holdings) {
        const prices = await this.getCurrentPrices(holdings.map(h => h.tokenAddress));
        
        const totalValue = holdings.reduce((sum, holding) => 
            sum + holding.amount * prices[holding.tokenAddress], 0);

        const performance = await this.calculatePerformance(holdings, prices);
        const risk = await this.calculateRiskMetrics(holdings, prices);

        return { performance, risk };
    }

    async calculateRiskMetrics(holdings, prices) {
        const returns = await this.getHistoricalReturns(holdings);
        
        return {
            portfolioBeta: this.calculateBeta(returns),
            sharpeRatio: this.calculateSharpeRatio(returns),
            diversificationScore: this.calculateDiversificationScore(holdings),
            valueAtRisk: this.calculateVaR(returns)
        };
    }
}
