const { PermissionFlagsBits } = require('discord.js');
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
	name: "ban",
    description: "Bans a user.",
    usage: "@user <reason>",
    permissions: PermissionFlagsBits.BanMembers,
    cooldown: 5,
	
	async execute(message, args) {
        const member = message.mentions.members.first();
        const reason = args.slice(1).join(' ') || 'No Reason Provided';
        const serverId = message.guild.id;
        const timestamp = new Date().toISOString();

        if (!member) {
            const errEmbed = new ErrorEmbed()
                .setTitle('Please mention a user to ban!')

            const replyMessage = await message.reply({ embeds: [errEmbed] });
                setTimeout(() => {
		    message.delete().catch(Logger.error);
                    replyMessage.delete().catch(Logger.error);
            }, 7500);
            return;
        }

        if (message.member.roles.highest.position <= member.roles.highest.position) {
            const errEmbed = new ErrorEmbed()
                .setTitle(`You can't punish <@${member.id}> as they have the same role/higher role than you.`)

            const replyMessage = await message.reply({ embeds: [errEmbed] });
                setTimeout(() => {
		    message.delete().catch(Logger.error);
                    replyMessage.delete().catch(Logger.error);
            }, 7500);
            return;
        }

        const embed = new Embed()
            .setTitle(`Successfully banned ${member.user.username} from this server!`)
            .addFields({ 
                    name: `<:arrowpoint:1248125837379768370> Punishment Details`,
                    value: `<:line:1248940390589923328> **Offender -** ${member.user.username}\n<:line:1248940390589923328> **Reason -** ${reason}\n<:line:1248940390589923328> **Moderator -** <@${message.author.id}>`
                });
        
        await member.ban({ reason })
        await db.run(`
            INSERT INTO logs (server_id, punishment, user_id, timestamp, reason, moderator_id) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [serverId, 'ban', member.user.id, timestamp, reason, message.author.id]
        ).catch(err => Logger.error(`Error logging punishment: ${err.message}`));
        await message.channel.reply({ embeds: [embed] });
	},
};
