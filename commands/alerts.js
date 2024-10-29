// Add to commands/alerts.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alerts')
        .setDescription('Manage token alerts')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a new token alert')
                .addStringOption(option =>
                    option.setName('address')
                        .setDescription('Token address to monitor')
                        .setRequired(true))
                .addNumberOption(option =>
                    option.setName('price_target')
                        .setDescription('Price target for alert')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('condition')
                        .setDescription('Alert condition')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Above', value: 'above' },
                            { name: 'Below', value: 'below' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all your active alerts'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove an alert')
                .addStringOption(option =>
                    option.setName('alert_id')
                        .setDescription('ID of the alert to remove')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const alertsManager = new AlertsManager();

        switch (subcommand) {
            case 'add':
                const address = interaction.options.getString('address');
                const priceTarget = interaction.options.getNumber('price_target');
                const condition = interaction.options.getString('condition');
                await alertsManager.addAlert(interaction.user.id, address, priceTarget, condition);
                break;
            case 'list':
                await alertsManager.listAlerts(interaction.user.id);
                break;
            case 'remove':
                const alertId = interaction.options.getString('alert_id');
                await alertsManager.removeAlert(interaction.user.id, alertId);
                break;
        }
    }
};