// models/Token.js
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    address: { type: String, required: true, unique: true },
    ticker: { type: String, required: true },
    deployer: { type: String, required: true },
    launchDate: { type: Date, required: true },
    initialPrice: { type: Number, required: true },
    description: String,
    deployerInfo: {
        isWhitelisted: { type: Boolean, default: false },
        reputation: { type: Number, default: 0 },
        successRate: { type: Number, default: 0 },
        totalLaunches: { type: Number, default: 0 }
    },
    metrics: {
        initialMarketCap: Number,
        liquidityAmount: Number,
        liquidityLocked: Boolean,
        initialHolders: Number,
        topHolderConcentration: Number
    },
    score: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Token', tokenSchema);