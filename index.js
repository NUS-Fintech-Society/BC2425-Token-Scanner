// index.js
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const connectDB = require('./database');

// Import core services
const TokenScanner = require('./services/tokenScanner');
const ApiService = require('./services/apiService');
const PortfolioManager = require('./services/portfolioManager');
const TechnicalAnalysis = require('./services/technicalAnalysis');
const AlertsManager = require('./services/AlertsManager');
const SocialSentimentAnalyzer = require('./services/socialSentiment');
const TradingStrategyAdvisor = require('./services/tradingStrategy');
const LaunchMonitor = require('./services/launchMonitor');
const WalletTracker = require('./services/walletTracker');
const FilterManager = require('./services/FilterManager');
const RecommendationEngine = require('./services/recommendationEngine');

class TokenScannerBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers
            ]
        });

        // Initialize collections
        this.client.commands = new Collection();
        
        // Initialize services
        this.initializeServices();
        
        // Bind event handlers
        this.client.once('ready', this.handleReady.bind(this));
        this.client.on('interactionCreate', this.handleInteraction.bind(this));
        this.client.on('error', this.handleError.bind(this));
    }

    async initializeServices() {
        try {
            // Core services
            this.apiService = new ApiService();
            this.tokenScanner = new TokenScanner(this.apiService);

            this.portfolioManager = new PortfolioManager();
            this.technicalAnalysis = new TechnicalAnalysis();
            this.alertsManager = new AlertsManager();
            this.socialAnalyzer = new SocialSentimentAnalyzer();
            this.strategyAdvisor = new TradingStrategyAdvisor(
                this.tokenScanner,
                this.socialAnalyzer
            );



            // Initialize other services
            this.launchMonitor = new LaunchMonitor(this.apiService);
            this.walletTracker = new WalletTracker();
            this.filterManager = new FilterManager();
            this.recommendationEngine = new RecommendationEngine(
                this.tokenScanner,
                this.apiService
            );

            console.log('All services initialized');
            // Load commands
            await this.loadCommands();

        } catch (error) {
            console.error('Error initializing services:', error);
            process.exit(1);
        }
    }

    async loadCommands() {
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => 
            file.endsWith('.js')
        );

        for (const file of commandFiles) {
            try {
                const command = require(path.join(commandsPath, file));
                if ('data' in command && 'execute' in command) {
                    this.client.commands.set(command.data.name, command);
                    console.log(`Loaded command: ${command.data.name}`);
                }
            } catch (error) {
                console.error(`Error loading command ${file}:`, error);
            }
        }
    }

    async start() {
        try {
            // Connect to MongoDB
            // Connect to MongoDB first

            
            await connectDB();
            console.log('Database connection established');

            // Start monitoring services
            this.startMonitoringServices();

            // Login to Discord
            await this.client.login(config.DISCORD_TOKEN);

            console.log('Bot started successfully');
        } catch (error) {
            console.error('Error starting bot:', error);
            process.exit(1);
        }
    }

    startMonitoringServices() {
        console.log('starting monitoring services...');
        // Monitor new launches
        setInterval(async () => {
            try {
                await this.launchMonitor.monitorNewLaunches();
            } catch (error) {
                console.error('Launch monitoring error:', error);
            }
        }, config.LAUNCH_MONITOR_INTERVAL);

        // Check alerts
        setInterval(async () => {
            try {
                await this.alertsManager.checkAlerts();
            } catch (error) {
                console.error('Alert checking error:', error);
            }
        }, config.ALERT_CHECK_INTERVAL);

        // Update portfolios
        setInterval(async () => {
            try {
                await this.portfolioManager.updateAllPortfolios();
            } catch (error) {
                console.error('Portfolio update error:', error);
            }
        }, config.PORTFOLIO_UPDATE_INTERVAL);

        // Monitor trading volume
        setInterval(async () => {
            try {
                const trades = await this.apiService.getLatestTrades();
                await this.processNewTrades(trades);
            } catch (error) {
                console.error('Trade monitoring error:', error);
            }
        }, config.TRADE_MONITOR_INTERVAL);
    }

    async processNewTrades(trades) {
        for (const trade of trades) {
            if (trade.amount >= config.VOLUME_THRESHOLDS.LOW) {
                const analysis = await this.analyzeTrade(trade);
                if (analysis.significant) {
                    await this.sendTradeAlert(analysis);
                }
            }
        }
    }

    async analyzeTrade(trade) {
        const [
            tokenInfo,
            technicalData,
            socialImpact
        ] = await Promise.all([
            this.tokenScanner.getTokenInfo(trade.tokenAddress),
            this.technicalAnalysis.calculateIndicators(trade.tokenAddress),
            this.socialAnalyzer.analyzeSentiment(trade.tokenAddress)
        ]);

        return {
            trade,
            token: tokenInfo,
            technical: technicalData,
            social: socialImpact,
            significant: this.isSignificantTrade(trade, tokenInfo)
        };
    }

    async sendTradeAlert(analysis) {
        const embed = new EmbedBuilder()
            .setTitle('🚨 Significant Trade Alert')
            .setColor(this.getAlertColor(analysis.trade.amount))
            .addFields(
                { name: 'Token', value: analysis.token.name },
                { name: 'Amount', value: `${analysis.trade.amount} SOL` },
                { name: 'Price Impact', value: `${analysis.trade.priceImpact}%` },
                { name: 'Technical Signals', value: this.formatTechnicalSignals(analysis.technical) }
            )
            .setTimestamp();

        const channel = await this.client.channels.fetch(config.ALERT_CHANNEL_ID);
        if (channel) {
            await channel.send({ embeds: [embed] });
        }
    }

    async handleReady() {
        console.log(`Logged in as ${this.client.user.tag}`);
        
        // Set bot presence
        this.client.user.setPresence({
            activities: [{ 
                name: 'pump.fun tokens',
                type: 'WATCHING'
            }],
            status: 'online'
        });
    }

    async handleInteraction(interaction) {
        if (!interaction.isCommand()) return;

        const command = this.client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, {
                tokenScanner: this.tokenScanner,
                portfolioManager: this.portfolioManager,
                alertsManager: this.alertsManager,
                strategyAdvisor: this.strategyAdvisor,
                walletTracker: this.walletTracker,
                filterManager: this.filterManager,
                recommendationEngine: this.recommendationEngine
            });
        } catch (error) {
            console.error('Command execution error:', error);
            const errorMessage = 'An error occurred while executing this command.';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ 
                    content: errorMessage,
                    ephemeral: true 
                });
            } else {
                await interaction.reply({ 
                    content: errorMessage,
                    ephemeral: true 
                });
            }
        }
    }

    handleError(error) {
        console.error('Discord client error:', error);
    }

    getAlertColor(amount) {
        if (amount >= config.VOLUME_THRESHOLDS.HIGH) return '#FF0000';
        if (amount >= config.VOLUME_THRESHOLDS.MEDIUM) return '#FFA500';
        return '#FFFF00';
    }

    formatTechnicalSignals(technical) {
        const signals = [];
        if (technical.rsi > 70) signals.push('🔴 Overbought (RSI)');
        if (technical.rsi < 30) signals.push('🟢 Oversold (RSI)');
        if (technical.macd.signal === 'buy') signals.push('🟢 MACD Buy');
        if (technical.macd.signal === 'sell') signals.push('🔴 MACD Sell');
        return signals.join('\n') || 'No significant signals';
    }

    isSignificantTrade(trade, tokenInfo) {
        return (
            trade.amount >= config.VOLUME_THRESHOLDS.MEDIUM ||
            trade.priceImpact >= 5 ||
            trade.amount >= tokenInfo.liquidity * 0.1
        );
    }
}

// Create and start bot instance
const bot = new TokenScannerBot();

console.log("   _____ _                 _       _     _     _   ");
bot.start().catch(console.error);

// Handle process events
process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});

process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await mongoose.connection.close();
    process.exit(0);
});

module.exports = TokenScannerBot;