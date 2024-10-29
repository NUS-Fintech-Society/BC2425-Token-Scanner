// Add to commands/wallet.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wallet')
        .setDescription('Track and analyze wallets')
        .addSubcommand(subcommand =>
            subcommand
                .setName('track')
                .setDescription('Track a wallet address')
                .addStringOption(option =>
                    option.setName('address')
                        .setDescription('Wallet address to track')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('analyze')
                .setDescription('Analyze a wallet\'s trading history')
                .addStringOption(option =>
                    option.setName('address')
                        .setDescription('Wallet address to analyze')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('untrack')
                .setDescription('Stop tracking a wallet')
                .addStringOption(option =>
                    option.setName('address')
                        .setDescription('Wallet address to untrack')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const walletTracker = new WalletTracker();

        switch (subcommand) {
            case 'track':
                const address = interaction.options.getString('address');
                await walletTracker.trackWallet(interaction.user.id, address);
                break;
            case 'analyze':
                const analyzeAddress = interaction.options.getString('address');
                await walletTracker.analyzeWallet(analyzeAddress);
                break;
            case 'untrack':
                const untrackAddress = interaction.options.getString('address');
                await walletTracker.untrackWallet(interaction.user.id, untrackAddress);
                break;
        }
    }
};