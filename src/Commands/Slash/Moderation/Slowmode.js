const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { ErrorEmbed } = require('@utils/Embed');
const Logger = require('@utils/Logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set the slowmode for the current channel.')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('The slowmode duration (e.g., 10s, 5m, 1h)')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const timeInput = interaction.options.getString('time');
        const channel = interaction.channel;

        const parseTime = (time) => {
            const timeRegex = /^(\d+)(s|m|h)$/;
            const match = time.match(timeRegex);

            if (!match) {
                return null;
            }

            const value = parseInt(match[1], 10);
            const unit = match[2];

            switch (unit) {
                case 's':
                    return value;
                case 'm':
                    return value * 60;
                case 'h':
                    return value * 3600;
                default:
                    return null;
            }
        };

        const slowmodeDuration = parseTime(timeInput);

        if (slowmodeDuration === null || slowmodeDuration < 0 || slowmodeDuration > 21600) {
            const errEmbed = new ErrorEmbed()
                .setTitle('Invalid time format')
                .setDescription('Please provide a valid time duration (e.g., 10s, 5m, 1h). The maximum is 6 hours (21600 seconds).');
            await interaction.reply({ embeds: [errEmbed], ephemeral: true });
            return;
        }

        try {
            await channel.setRateLimitPerUser(slowmodeDuration);
            await interaction.reply(`Slowmode has been set to ${timeInput}.`);
        } catch (error) {
            Logger.error(`Error setting slowmode: ${error.message}`);
            const errEmbed = new ErrorEmbed()
                .setTitle('Error setting slowmode')
                .setDescription('An error occurred while setting the slowmode. Please try again later.');
            await interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }
    },
};
