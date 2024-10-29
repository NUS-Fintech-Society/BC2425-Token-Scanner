// Add models/Alert.js
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    tokenAddress: { type: String, required: true },
    priceTarget: { type: Number, required: true },
    condition: { type: String, enum: ['above', 'below'], required: true },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);