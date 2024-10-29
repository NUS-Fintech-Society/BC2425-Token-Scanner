// models/DeployerWallet.js
const mongoose = require('mongoose');

const deployerWalletSchema = new mongoose.Schema({
    address: { type: String, required: true, unique: true },
    totalLaunches: { type: Number, default: 0 },
    successfulLaunches: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },
    lastActivity: { type: Date },
    isBlacklisted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeployerWallet', deployerWalletSchema);