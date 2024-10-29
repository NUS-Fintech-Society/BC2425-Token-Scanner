# Token Scanner Bot 🤖

A comprehensive Discord bot for analyzing tokens on pump.fun, providing real-time alerts, trading strategies, and social sentiment analysis.

## Features 🌟

### Token Analysis
- Real-time token scanning and monitoring
- Custom filters for token detection
- Holder distribution analysis
- Burn tracking
- CTO (Community Takeover) detection
- Smart wallet tracking

### Trading Tools
- Volume surge detection
- Price alerts
- Trading strategy recommendations
- Technical analysis indicators
- Entry/exit point suggestions
- Risk assessment

### Social Sentiment
- Twitter sentiment analysis
- Telegram activity monitoring
- Reddit discussions tracking
- Community growth metrics
- Influencer detection

### Wallet Tracking
- Smart money flow analysis
- Whale activity monitoring
- Portfolio tracking
- Performance metrics
- Trading pattern detection

## Prerequisites 📋

- Node.js (v16 or higher)
- MongoDB
- Redis
- Solana RPC endpoint
- Discord Bot Token
- Twitter API credentials

## Installation 🚀

1. Clone the repository:
```bash
git clone https://github.com/NUS-Fintech-Society/Vision-Token-Scanner
cd Vision-Token-Scanner
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Discord
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id

# Database
MONGODB_URI=your_mongodb_uri
REDIS_URL=your_redis_url

# Blockchain
SOLANA_RPC_URL=your_solana_rpc_url

# Social APIs
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret
```

## Usage 💡

### Bot Commands

#### Token Analysis
```
/scan [address] - Scan a specific token
/recommend - Get token recommendations
/analyze [address] [type] - Detailed token analysis
```

#### Alerts
```
/alerts add [address] [price] [condition] - Set price alert
/alerts list - View active alerts
/alerts remove [alert_id] - Remove alert
```

#### Wallet Tracking
```
/wallet track [address] - Track wallet
/wallet analyze [address] - Analyze wallet
/wallet untrack [address] - Stop tracking
```

#### Filters
```
/filter set - Configure token filters
/filter clear - Reset filters
/filter show - Display current filters
```

#### Trading Strategy
```
/strategy [address] [risk] - Get trading recommendations
```

### Example Usage

1. Scan a token:
```
/scan address:FT2KZqHV4mhNBpeU2w9JE1kpEFbahGCMiWV6fytMGxhS
```

2. Set up an alert:
```
/alerts add address:FT2KZqHV4mhNBpeU2w9JE1kpEFbahGCMiWV6fytMGxhS price:1.5 condition:above
```

3. Get trading strategy:
```
/strategy address:FT2KZqHV4mhNBpeU2w9JE1kpEFbahGCMiWV6fytMGxhS risk:moderate
```

## Configuration ⚙️

### Token Scanner Settings
- Minimum holder threshold: 50
- Maximum top holder concentration: 50%
- Volume surge thresholds:
  - Low: 3 SOL
  - Medium: 5 SOL
  - High: 10 SOL

### Alert Settings
- Price check interval: 30 seconds
- Volume check interval: 5 seconds
- Maximum alerts per user: 10

## Project Structure 📁

```
token-scanner-bot/
├── config.js
├── index.js
├── models/
│   ├── Token.js
│   ├── DeployerWallet.js
│   ├── Alert.js
│   └── TrackedWallet.js
├── services/
│   ├── tokenScanner.js
│   ├── apiService.js
│   ├── recommendationEngine.js
│   ├── socialSentiment.js
│   ├── tradingStrategy.js
│   └── advancedAnalytics.js
├── commands/
│   ├── scan.js
│   ├── recommend.js
│   ├── alerts.js
│   ├── wallet.js
│   ├── filter.js
│   ├── analyze.js
│   └── strategy.js
└── utils/
    ├── api.js
    └── redis.js
```

## API Endpoints 🔗

### Pump.fun API
- Latest tokens: `https://frontend-api.pump.fun/coins/latest`
- Latest trades: `https://frontend-api.pump.fun/trades/latest`
- Token replies: `https://frontend-api.pump.fun/replies`
- SOL price: `https://frontend-api.pump.fun/sol-price`

### Dexscreener API
- Order status: `https://marketplace.dexscreener.com/order-status/solana/{address}`
- Orders: `https://api.dexscreener.com/v1/orders/solana/{address}`

## Contributing 🤝

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 👏

- [pump.fun](https://pump.fun) for the API
- [Dexscreener](https://dexscreener.com) for market data
- [discord.js](https://discord.js.org) for Discord integration

## Support 💬

For support and inquiries:
- Create an issue in the GitHub repository
- Join our Discord server: //TODO [Discord Invite Link]
- Follow us on Twitter: //TODO [@TokenScannerBot]