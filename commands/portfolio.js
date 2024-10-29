// Add to commands/portfolio.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('portfolio')
        .setDescription('Manage your token portfolio')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add token to portfolio')
                .addStringOption(option =>
                    option.setName('address')
                        .setDescription('Token address')
                        .setRequired(true))
                .addNumberOption(option =>
                    option.setName('amount')
                        .setDescription('Token amount')
                        .setRequired(true))
                .addNumberOption(option =>
                    option.setName('buy_price')
                        .setDescription('Buy price in SOL')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View portfolio stats'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('analyze')
                .setDescription('Get portfolio analysis')),

    async execute(interaction) {
        const portfolioManager = new PortfolioManager();
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'add':
                const address = interaction.options.getString('address');
                const amount = interaction.options.getNumber('amount');
                const buyPrice = interaction.options.getNumber('buy_price');
                
                await portfolioManager.addHolding(
                    interaction.user.id,
                    { address, amount, buyPrice }
                );
                break;

            case 'view':
                const portfolio = await portfolioManager.getPortfolio(
                    interaction.user.id
                );
                const embed = createPortfolioEmbed(portfolio);
                await interaction.reply({ embeds: [embed] });
                break;

            case 'analyze':
                const analysis = await portfolioManager.analyzePortfolio(
                    interaction.user.id
                );
                const analysisEmbed = createPortfolioAnalysisEmbed(analysis);
                await interaction.reply({ embeds: [analysisEmbed] });
                break;
        }
    }
};
