const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Embed, ErrorEmbed } = require('@utils/Embed');
const Logger = require('@utils/Logger');
const Helper = require('@db/Helper');
const path = require('path');

const dbPath = path.join(__dirname, '../../../Database/Databases/punishments.db');
const db = new Helper(dbPath);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the ban.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),               

    async execute(interaction) {
        const member = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No Reason Provided';
        const serverId = interaction.guild.id;
        const timestamp = new Date().toISOString();

        try {
            if (!member) {
                const errEmbed = new ErrorEmbed()
                    .setTitle('Please mention a user to ban!');
                await interaction.reply({ embeds: [errEmbed], ephemeral: true });
                return;
            }

            if (interaction.member.roles.highest.position <= member.roles.highest.position) {
                const errEmbed = new ErrorEmbed()
                    .setTitle(`You can't punish <@${member.id}> as they have the same role/higher role than you.`);
                await interaction.reply({ embeds: [errEmbed], ephemeral: true });
                return;
            }

            const embed = new Embed()
                .setTitle(`Successfully banned ${member.user.username} from this server!`)
                .addFields({
                    name: `<:arrowpoint:1248125837379768370> Punishment Details`,
                    value: `<:line:1248940390589923328> **Offender -** ${member.user.username}\n<:line:1248940390589923328> **Reason -** ${reason}\n<:line:1248940390589923328> **Moderator -** <@${interaction.user.id}>`
                });

            await member.ban({ reason });
            await db.run(`
                INSERT INTO logs (server_id, punishment, user_id, timestamp, reason, moderator_id) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [serverId, 'ban', member.user.id, timestamp, reason, interaction.user.id]
            );
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            Logger.error(`Error executing ban command: ${error.message}`);
            const errEmbed = new ErrorEmbed()
                .setTitle('An error occurred while executing the ban command!');
            await interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }
    },
};
