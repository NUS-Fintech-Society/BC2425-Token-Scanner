// Add to commands/strategy.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('strategy')
        .setDescription('Get trading strategy recommendations')
        .addStringOption(option =>
            option.setName('address')
                .setDescription('Token address')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('risk')
                .setDescription('Risk tolerance')
                .setRequired(true)
                .addChoices(
                    { name: 'Conservative', value: 'conservative' },
                    { name: 'Moderate', value: 'moderate' },
                    { name: 'Aggressive', value: 'aggressive' }
                )),

    async execute(interaction) {
        await interaction.deferReply();

        const address = interaction.options.getString('address');
        const riskTolerance = interaction.options.getString('risk');
        
        const advisor = new TradingStrategyAdvisor(
            new TokenScanner(),
            new SocialSentimentAnalyzer()
        );

        const token = await Token.findOne({ address });
        const strategy = await advisor.generateStrategy(token, riskTolerance);

        const embed = createStrategyEmbed(strategy);
        await interaction.editReply({ embeds: [embed] });
    }
};