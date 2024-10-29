// Add to commands/analyze.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('analyze')
        .setDescription('Advanced token analysis')
        .addStringOption(option =>
            option.setName('address')
                .setDescription('Token address to analyze')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of analysis')
                .setRequired(true)
                .addChoices(
                    { name: 'Quick', value: 'quick' },
                    { name: 'Full', value: 'full' },
                    { name: 'Technical', value: 'technical' },
                    { name: 'Social', value: 'social' },
                    { name: 'Whale', value: 'whale' }
                )),

    async execute(interaction) {
        await interaction.deferReply();

        const address = interaction.options.getString('address');
        const type = interaction.options.getString('type');
        
        const analytics = new AdvancedAnalytics();
        const token = await Token.findOne({ address });

        let analysis;
        switch (type) {
            case 'quick':
                analysis = await analytics.getQuickAnalysis(token);
                break;
            case 'full':
                analysis = await analytics.generateComprehensiveReport(token);
                break;
            case 'technical':
                analysis = await analytics.getTechnicalAnalysis(token);
                break;
            case 'social':
                analysis = await analytics.socialAnalyzer.analyzeSentiment(token);
                break;
            case 'whale':
                analysis = await analytics.analyzeWhaleActivity(token);
                break;
        }

        const embed = createAnalysisEmbed(analysis, type);
        await interaction.editReply({ embeds: [embed] });
    }
};