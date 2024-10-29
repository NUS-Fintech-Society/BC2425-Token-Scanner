// models/ExperiencedDev.js
const mongoose = require('mongoose');

const experiencedDevSchema = new mongoose.Schema({
    address: { type: String, required: true, unique: true },
    reputation: { type: Number, default: 0 },
    averageSuccessRate: { type: Number, default: 0 },
    totalLaunches: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExperiencedDev', experiencedDevSchema);