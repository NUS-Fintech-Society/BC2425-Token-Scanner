// Add to commands/filter.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter')
        .setDescription('Manage token filters')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set token filters')
                .addNumberOption(option =>
                    option.setName('min_holders')
                        .setDescription('Minimum number of holders'))
                .addNumberOption(option =>
                    option.setName('min_liquidity')
                        .setDescription('Minimum liquidity in SOL'))
                .addNumberOption(option =>
                    option.setName('min_market_cap')
                        .setDescription('Minimum market cap in SOL'))
                .addBooleanOption(option =>
                    option.setName('exclude_cto')
                        .setDescription('Exclude CTO tokens'))
                .addBooleanOption(option =>
                    option.setName('only_verified')
                        .setDescription('Only show verified tokens')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear all filters'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Show current filters')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const filterManager = new FilterManager();

        switch (subcommand) {
            case 'set':
                const filters = {
                    minHolders: interaction.options.getNumber('min_holders'),
                    minLiquidity: interaction.options.getNumber('min_liquidity'),
                    minMarketCap: interaction.options.getNumber('min_market_cap'),
                    excludeCTO: interaction.options.getBoolean('exclude_cto'),
                    onlyVerified: interaction.options.getBoolean('only_verified')
                };
                await filterManager.setFilters(interaction.user.id, filters);
                break;
            case 'clear':
                await filterManager.clearFilters(interaction.user.id);
                break;
            case 'show':
                await filterManager.showFilters(interaction.user.id);
                break;
        }
    }
};
