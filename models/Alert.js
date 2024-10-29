// models/Alert.js
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    tokenAddress: {
        type: String,
        required: true,
        index: true
    },
    priceTarget: {
        type: Number,
        required: true
    },
    condition: {
        type: String,
        enum: ['above', 'below', 'equals'],
        required: true
    },
    active: {
        type: Boolean,
        default: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    triggeredAt: {
        type: Date,
        default: null
    },
    triggerPrice: {
        type: Number,
        default: null
    },
    notificationsSent: {
        type: Number,
        default: 0
    },
    lastNotification: {
        type: Date,
        default: null
    }
});

// Add indexes for common queries
alertSchema.index({ userId: 1, active: 1 });
alertSchema.index({ tokenAddress: 1, active: 1 });
alertSchema.index({ createdAt: 1, active: 1 });

module.exports = mongoose.model('Alert', alertSchema);