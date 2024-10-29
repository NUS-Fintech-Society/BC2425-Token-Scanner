// commands/recommend.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recommend')
        .setDescription('Get token recommendations')
        .addNumberOption(option =>
            option.setName('min_mcap')
                .setDescription('Minimum market cap in SOL')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        const minMarketCap = interaction.options.getNumber('min_mcap') || 0;
        const engine = new RecommendationEngine(
            new TokenScanner(),
            new ApiService()
        );

        const recommendations = await engine.generateRecommendations({
            minMarketCap
        });

        const embed = createRecommendationsEmbed(recommendations);
        await interaction.editReply({ embeds: [embed] });
    }
};