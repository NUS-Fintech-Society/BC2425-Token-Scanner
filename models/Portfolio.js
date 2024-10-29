// models/Portfolio.js
const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    holdings: [{
        tokenAddress: { type: String, required: true },
        amount: { type: Number, required: true },
        buyPrice: { type: Number, required: true },
        buyDate: { type: Date, default: Date.now },
        tags: [String]
    }],
    performance: {
        totalValue: { type: Number, default: 0 },
        totalPnL: { type: Number, default: 0 },
        dailyPnL: { type: Number, default: 0 },
        bestPerformer: String,
        worstPerformer: String
    },
    riskMetrics: {
        portfolioBeta: { type: Number, default: 1 },
        sharpeRatio: { type: Number, default: 0 },
        diversificationScore: { type: Number, default: 0 },
        valueAtRisk: { type: Number, default: 0 }
    },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Portfolio', portfolioSchema);