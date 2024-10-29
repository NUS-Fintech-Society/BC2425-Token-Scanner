// commands/scan.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scan')
        .setDescription('Scan a token for analysis')
        .addStringOption(option =>
            option.setName('address')
                .setDescription('Token address to scan')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        const address = interaction.options.getString('address');
        const scanner = new TokenScanner();
        const analysis = await scanner.scanNewToken({ address });

        const embed = createAnalysisEmbed(analysis);
        await interaction.editReply({ embeds: [embed] });
    }
};
