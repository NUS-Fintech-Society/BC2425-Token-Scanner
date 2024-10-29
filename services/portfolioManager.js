// services/portfolioManager.js
const mongoose = require('mongoose');
const Portfolio = require('../models/Portfolio');
const ApiService = require('./apiService');
const config = require('../config');

class PortfolioManager {
    constructor() {
        this.Portfolio = Portfolio;
        this.apiService = new ApiService();
    }

    async createPortfolio(userId, initialHoldings = []) {
        try {
            const portfolio = new this.Portfolio({
                userId,
                holdings: initialHoldings,
                performance: {
                    totalValue: 0,
                    totalPnL: 0,
                    dailyPnL: 0,
                    bestPerformer: null,
                    worstPerformer: null
                },
                riskMetrics: {
                    portfolioBeta: 1,
                    sharpeRatio: 0,
                    diversificationScore: 0
                }
            });

            await portfolio.save();
            return portfolio;
        } catch (error) {
            console.error('Error creating portfolio:', error);
            throw error;
        }
    }

    async updatePortfolio(userId, holdings) {
        try {
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
        } catch (error) {
            console.error('Error updating portfolio:', error);
            throw error;
        }
    }

    async getPortfolio(userId) {
        try {
            const portfolio = await this.Portfolio.findOne({ userId });
            if (!portfolio) {
                return await this.createPortfolio(userId);
            }
            return portfolio;
        } catch (error) {
            console.error('Error getting portfolio:', error);
            throw error;
        }
    }

    async updateAllPortfolios() {
        try {
            const portfolios = await this.Portfolio.find({});
            for (const portfolio of portfolios) {
                await this.updatePortfolioMetrics(portfolio);
            }
        } catch (error) {
            console.error('Error updating all portfolios:', error);
            throw error;
        }
    }

    async updatePortfolioMetrics(portfolio) {
        try {
            const metrics = await this.calculatePortfolioMetrics(portfolio.holdings);
            await this.Portfolio.updateOne(
                { _id: portfolio._id },
                {
                    $set: {
                        performance: metrics.performance,
                        riskMetrics: metrics.risk,
                        lastUpdated: Date.now()
                    }
                }
            );
        } catch (error) {
            console.error('Error updating portfolio metrics:', error);
            throw error;
        }
    }

    async calculatePortfolioMetrics(holdings) {
        try {
            const prices = await this.getCurrentPrices(holdings.map(h => h.tokenAddress));
            
            const totalValue = holdings.reduce((sum, holding) => 
                sum + holding.amount * (prices[holding.tokenAddress] || 0), 0);

            const performance = await this.calculatePerformance(holdings, prices);
            const risk = await this.calculateRiskMetrics(holdings, prices);

            return { performance, risk };
        } catch (error) {
            console.error('Error calculating portfolio metrics:', error);
            throw error;
        }
    }

    async getCurrentPrices(tokenAddresses) {
        try {
            const prices = {};
            for (const address of tokenAddresses) {
                prices[address] = await this.apiService.getTokenPrice(address);
            }
            return prices;
        } catch (error) {
            console.error('Error getting current prices:', error);
            return {};
        }
    }

    async calculatePerformance(holdings, prices) {
        try {
            let bestPerformer = null;
            let worstPerformer = null;
            let bestReturn = -Infinity;
            let worstReturn = Infinity;
            let totalPnL = 0;
            let dailyPnL = 0;

            for (const holding of holdings) {
                const currentPrice = prices[holding.tokenAddress] || 0;
                const pnl = (currentPrice - holding.buyPrice) * holding.amount;
                totalPnL += pnl;

                const returnRate = (currentPrice - holding.buyPrice) / holding.buyPrice;
                if (returnRate > bestReturn) {
                    bestReturn = returnRate;
                    bestPerformer = holding.tokenAddress;
                }
                if (returnRate < worstReturn) {
                    worstReturn = returnRate;
                    worstPerformer = holding.tokenAddress;
                }
            }

            return {
                totalPnL,
                dailyPnL,
                bestPerformer,
                worstPerformer,
                totalValue: holdings.reduce((sum, h) => 
                    sum + h.amount * (prices[h.tokenAddress] || 0), 0)
            };
        } catch (error) {
            console.error('Error calculating performance:', error);
            throw error;
        }
    }

    async calculateRiskMetrics(holdings, prices) {
        try {
            const returns = await this.getHistoricalReturns(holdings);
            
            return {
                portfolioBeta: this.calculateBeta(returns),
                sharpeRatio: this.calculateSharpeRatio(returns),
                diversificationScore: this.calculateDiversificationScore(holdings),
                valueAtRisk: this.calculateVaR(returns)
            };
        } catch (error) {
            console.error('Error calculating risk metrics:', error);
            throw error;
        }
    }

    async getHistoricalReturns(holdings) {
        try {
            const returns = [];
            for (const holding of holdings) {
                const history = await this.apiService.getTokenPriceHistory(holding.tokenAddress);
                returns.push(this.calculateReturns(history));
            }
            return returns;
        } catch (error) {
            console.error('Error getting historical returns:', error);
            return [];
        }
    }

    calculateBeta(returns) {
        // Implement beta calculation
        return 1;
    }

    calculateSharpeRatio(returns, riskFreeRate = 0.02) {
        // Implement Sharpe ratio calculation
        return 0;
    }

    calculateDiversificationScore(holdings) {
        // Implement diversification score calculation
        return holdings.length > 1 ? Math.min(holdings.length / 10, 1) : 0;
    }

    calculateVaR(returns, confidenceLevel = 0.95) {
        // Implement Value at Risk calculation
        return 0;
    }

    calculateReturns(priceHistory) {
        // Implement returns calculation from price history
        return [];
    }
}

module.exports = PortfolioManager;