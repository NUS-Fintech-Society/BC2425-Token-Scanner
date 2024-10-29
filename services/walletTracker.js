// services/walletTracker.js
const { Connection } = require('@solana/web3.js');
const TrackedWallet = require('../models/TrackedWallet');
const config = require('../config');

class WalletTracker {
    constructor() {
        this.TrackedWallet = require('../models/TrackedWallet');
        this.connection = new Connection(config.SOLANA_RPC_URL);
    }

    async getWalletTrades(address) {
        try {
            const signatures = await this.connection.getSignaturesForAddress(
                new PublicKey(address),
                { limit: 1000 }
            );

            const trades = await Promise.all(
                signatures.map(sig => this.connection.getParsedTransaction(sig.signature))
            );

            return trades.filter(tx => this.isTradeTransaction(tx));
        } catch (error) {
            console.error('Error getting wallet trades:', error);
            return [];
        }
    }

    async analyzeTrades(trades) {
        const analysis = {
            totalTrades: trades.length,
            winningTrades: 0,
            totalProfit: 0,
            averageHoldTime: 0,
            tradesByToken: new Map()
        };

        for (const trade of trades) {
            const profitLoss = this.calculateTradeProfitLoss(trade);
            analysis.totalProfit += profitLoss;
            if (profitLoss > 0) analysis.winningTrades++;
            
            this.updateTokenStats(analysis.tradesByToken, trade);
        }

        return {
            totalTrades: analysis.totalTrades,
            winRate: analysis.winningTrades / analysis.totalTrades,
            avgHoldTime: this.calculateAverageHoldTime(trades),
            preferredTokens: this.getPreferredTokens(analysis.tradesByToken),
            riskLevel: this.calculateRiskLevel(analysis)
        };
    }

    calculateRiskLevel(analysis) {
        // Implement risk level calculation
        return 0.5;
    }
}

module.exports = WalletTracker;