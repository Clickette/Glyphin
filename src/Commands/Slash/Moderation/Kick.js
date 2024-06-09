const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Embed, ErrorEmbed } = require('@utils/Embed');
const Logger = require('@utils/Logger');
const Helper = require('@db/Helper');
const path = require('path');

const dbPath = path.join(__dirname, '../../../Database/Databases/punishments.db');
const db = new Helper(dbPath);

db.run(`
    CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id TEXT NOT NULL,
        punishment TEXT NOT NULL,
        user_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        reason TEXT,
        moderator_id TEXT NOT NULL
    )
`).catch(err => Logger.error(`Error creating table: ${err.message}`));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for kicking the user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    
    async execute(interaction) {
        await interaction.deferReply();

        const member = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No Reason Provided';
        const serverId = interaction.guild.id;
        const timestamp = new Date().toISOString();

        if (!member) {
            const errEmbed = new ErrorEmbed()
                .setTitle('Please mention a user to kick!');

            await interaction.editReply({ embeds: [errEmbed] });
            return;
        }

        if (interaction.member.roles.highest.position <= member.roles.highest.position) {
            const errEmbed = new ErrorEmbed()
                .setTitle(`You can't punish <@${member.user.id}> as they have the same role/higher role than you.`);

            await interaction.editReply({ embeds: [errEmbed] });
            return;
        }

        const embed = new Embed()
            .setTitle(`Successfully kicked ${member.user.username} from this server!`)
            .addFields({ 
                name: `<:arrowpoint:1248125837379768370> Punishment Details`,
                value: `<:line:1248940390589923328> **Offender -** ${member.user.username}\n<:line:1248940390589923328> **Reason -** ${reason}\n<:line:1248940390589923328> **Moderator -** <@${interaction.user.id}>`
            });

        try {
            await member.kick(reason);
            await db.run(`
                INSERT INTO logs (server_id, punishment, user_id, timestamp, reason, moderator_id) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [serverId, 'kick', member.user.id, timestamp, reason, interaction.user.id]
            );
            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            Logger.error(`Error executing kick command: ${err.message}`);
            const errEmbed = new ErrorEmbed()
                .setTitle('An error occurred while attempting to kick the user!');

            await interaction.editReply({ embeds: [errEmbed] });
        }
    },
};
