const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Logger = require('@utils/Logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Select a member and ban them.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The member to ban')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for banning'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),

    async execute(interaction) {
        try {
            // debug!!!!
            Logger.json(`Interaction: ${interaction}`);

            const target = interaction.options.getUser('target');
            const reason = interaction.options.getString('reason') ?? 'No reason provided';

            Logger.info(`Target: ${target}`);
            Logger.info(`Reason: ${reason}`);

            if (!target) {
                return interaction.reply({
                    content: 'Could not find the specified user. Please try again.',
                    ephemeral: true,
                });
            }

            const member = interaction.guild.members.cache.get(target.id);
            Logger.info(`Member: ${member}`);

            if (!member) {
                return interaction.reply({
                    content: 'The specified user is not a member of this guild.',
                    ephemeral: true,
                });
            }

            if (!member.bannable) {
                return interaction.reply({
                    content: 'I cannot ban this user. Do they have a higher role?',
                    ephemeral: true,
                });
            }

            await member.ban({ reason });
            await interaction.reply(`Banning ${target.username} for reason: ${reason}`);
        } catch (error) {
            Logger.error(error);
            await interaction.reply({
                content: 'An error occurred while attempting to execute this command! Please report this to the developers.',
                ephemeral: true,
            });
        }
    },
};
