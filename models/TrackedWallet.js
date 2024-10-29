// Add models/TrackedWallet.js
const mongoose = require('mongoose');

const trackedWalletSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    address: { type: String, required: true },
    lastTradeTimestamp: { type: Date },
    profitLoss: { type: Number, default: 0 },
    totalTrades: { type: Number, default: 0 },
    successfulTrades: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrackedWallet', trackedWalletSchema);