// config.js
require('dotenv').config();

module.exports = {
    // Discord Configuration
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    GUILD_ID: process.env.GUILD_ID,
    ALERT_CHANNEL_ID: process.env.ALERT_CHANNEL_ID,

    // API Endpoints
    PUMP_FUN_API: 'https://frontend-api.pump.fun',
    DEXSCREENER_API: 'https://api.dexscreener.com/v1/orders/solana',
    SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || "https://solana-api.instantnodes.io/token-xf6ROBEHSjwaIjoO2exGjqXn5MDeocgU",

    // Database Configuration
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/token-scanner',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

    // Monitoring Intervals (in milliseconds)
    LAUNCH_MONITOR_INTERVAL: 5000,
    ALERT_CHECK_INTERVAL: 30000,
    PORTFOLIO_UPDATE_INTERVAL: 60000,
    TRADE_MONITOR_INTERVAL: 5000,

    // Volume Thresholds (in SOL)
    VOLUME_THRESHOLDS: {
        LOW: 3,
        MEDIUM: 5,
        HIGH: 10
    },

    // Cache TTL Settings (in seconds)
    CACHE_TTL: {
        tokens: 60,
        trades: 30,
        replies: 300,
        price: 60,
        dexscreener: 300
    },

    // Rate Limiting
    RATE_LIMITS: {
        PUMP_FUN: {
            maxRequests: 30,
            perMilliseconds: 60000
        },
        DEXSCREENER: {
            maxRequests: 20,
            perMilliseconds: 60000
        }
    },

    RISK_LEVELS: {
        LOW: {
            stopLossPercent: 5,
            takeProfitPercent: 15,
            maxPositionSize: 0.1
        },
        MEDIUM: {
            stopLossPercent: 10,
            takeProfitPercent: 30,
            maxPositionSize: 0.2
        },
        HIGH: {
            stopLossPercent: 20,
            takeProfitPercent: 50,
            maxPositionSize: 0.3
        }
    },
    TIMEFRAMES: {
        SHORT: {
            maxDuration: '24h',
            intervalCheck: '5m'
        },
        MEDIUM: {
            maxDuration: '7d',
            intervalCheck: '1h'
        },
        LONG: {
            maxDuration: '30d',
            intervalCheck: '4h'
        }
    },
    ANALYSIS_WEIGHTS: {
        TECHNICAL: 0.4,
        SENTIMENT: 0.2,
        ONCHAIN: 0.2,
        WHALE: 0.2
    },
    INDICATOR_SETTINGS: {
        RSI: {
            oversold: 30,
            overbought: 70,
            period: 14
        },
        MACD: {
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9
        },
        VOLUME: {
            significantChange: 200 // percentage
        }
    }
};