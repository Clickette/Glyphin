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
        .setName('unban')
        .setDescription('Unbans a user.')
        .addStringOption(option => 
            option.setName('userid')
                .setDescription('The ID of the user to unban')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for unbanning the user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        const id = interaction.options.getString('userid');
        const reason = interaction.options.getString('reason') || 'No Reason Provided';
        const serverId = interaction.guild.id;
        const timestamp = new Date().toISOString();
        
        try {
            const bannedMembers = await interaction.guild.bans.fetch();
            const member = bannedMembers.find(user => user.user.id === id);

            if (!member) {
                const errEmbed = new ErrorEmbed()
                    .setTitle('The mentioned ID does not belong to a banned user!');

                await interaction.editReply({ embeds: [errEmbed] });
                return;
            }

            const embed = new Embed()
                .setTitle(`Successfully unbanned ${member.user.username} from this server!`)
                .addFields({ 
                    name: `<:arrowpoint:1248125837379768370> Punishment Details`,
                    value: `<:line:1248940390589923328> **Offender -** ${member.user.username}\n<:line:1248940390589923328> **Moderator -** <@${interaction.user.id}>`
                });

            await interaction.guild.members.unban(id);
            await db.run(`
                INSERT INTO logs (server_id, punishment, user_id, timestamp, reason, moderator_id) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [serverId, 'unban', member.user.id, timestamp, reason, interaction.user.id]
            ).catch(err => Logger.error(`Error logging punishment: ${err.message}`));

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            Logger.error(`Error executing unban command: ${error.message}`);
            const errEmbed = new ErrorEmbed()
                .setTitle('An error occurred while attempting to unban the user!');
            
            await interaction.editReply({ embeds: [errEmbed] });
        }
    },
};
