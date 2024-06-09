const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Embed, ErrorEmbed } = require('@utils/Embed');
const Logger = require('@utils/Logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears a certain number of messages from the channel.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The number of messages to clear (max 100).')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        let amount = interaction.options.getInteger('amount');

        try {
            // check for the message limits
            if (amount > 100) {
                amount = 100;
            } else if (amount < 1) {
                const errEmbed = new ErrorEmbed()
                    .setTitle('Please provide a valid number of messages to clear!');
                await interaction.reply({ embeds: [errEmbed], ephemeral: true });
                return;
            }

            const channel = interaction.channel;
            const fetched = await channel.messages.fetch({ limit: amount });
            await channel.bulkDelete(fetched);

            const embed = new Embed()
                .setTitle(`Successfully cleared ${fetched.size} messages from this channel!`)
                .setDescription(`<:line:1248940390589923328> **Moderator -** <@${interaction.user.id}>`)
                .setColor('#F8C822');

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            Logger.error(`Error executing clear command: ${error.message}`);
            const errEmbed = new ErrorEmbed()
                .setTitle('An error occurred while executing the clear command!');
            await interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }
    },
};
