const { PermissionFlagsBits } = require('discord.js');
const { Embed, ErrorEmbed } = require('@utils/Embed');
const Logger = require('@utils/Logger');
const Helper = require('@db/Helper');
const path = require('path');

module.exports = {
    name: "autorole",
    description: "Manage autorole settings",
    usage: 'autorole <enable|disable|setid> [role_id]',
    permissions: PermissionFlagsBits.ManageGuild,
    cooldown: 5,

    async execute(message, args) {
        const dbPath = path.join(__dirname, '../../../Database/Databases/config/autorole.db');
        const db = new Helper(dbPath);

        if (args.length === 0) {
            const cooldownError = new ErrorEmbed()
                .setAuthor({
                    name: "Uh Oh!",
                    iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
                })
                .setTitle('Missing arguments. Please use `g:autorole [enable/disable/setid] <role id>`!')

            const replyMessage = await message.reply({
                embeds: [cooldownError]
            });
            setTimeout(() => {
                message.delete();
                replyMessage.delete();
            }, 7500);
            return;
        }

        const serverId = message.guild.id;
        const action = args[0].toLowerCase();

        await db.run(`
                CREATE TABLE IF NOT EXISTS autorole (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    server_id TEXT NOT NULL UNIQUE,
                    enabled BOOLEAN NOT NULL,
                    autorole_id TEXT NOT NULL
                );
            `);

        if (action === 'enable') {
            await enableAutorole(db, serverId);
            const embed = new Embed()
                .setTitle('<:titlesuccess:1249439702608773170> Auto role enabled!')
                .setDescription('<:line:1249439670954102905> Please setup which role new members should be assigned by running :\n<:line:1249439670954102905> `g:autorole setid <role id>`')

            message.reply({ embeds: [embed] });

        } else if (action === 'disable') {
            await disableAutorole(db, serverId);
            const embed = new Embed()
                .setTitle('<:titlesuccess:1249439702608773170> Auto role disabled!')
                .setDescription('<:line:1249439670954102905> No further action is needed on your end.\n<:line:1249439670954102905> To enable again run `g:autorole enable`!')

            message.reply({ embeds: [embed] });

        } else if (action === 'setid') {
            if (args.length < 2) {
                const cooldownError = new ErrorEmbed()
                    .setAuthor({
                        name: "Uh Oh!",
                        iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
                    })
                    .setTitle('Missing arguments. Please use `g:autorole setid <role id>`!')

                const replyMessage = await message.reply({
                    embeds: [cooldownError]
                });
                setTimeout(() => {
                    message.delete();
                    replyMessage.delete();
                }, 7500);
                return;
            }
            const roleId = args[1];
            const role = await message.guild.roles.fetch(roleId);
            if (!role) {
                const cooldownError = new ErrorEmbed()
                    .setAuthor({
                        name: "Uh Oh!",
                        iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
                    })
                    .setTitle('Invalid role ID! Please provide a valid role.')

                const replyMessage = await message.reply({
                    embeds: [cooldownError]
                });
                setTimeout(() => {
                    message.delete();
                    replyMessage.delete();
                }, 7500);
                return;
            }

            await setAutoroleId(db, serverId, roleId);
            const embed = new Embed()
                .setTitle('<:titlesuccess:1249439702608773170> Auto role ID Set!')
                .setDescription(`<:line:1249439670954102905> Members will now be assigned <@&${roleId}> when they join!`)

            message.reply({ embeds: [embed] });

        } else {
            const cooldownError = new ErrorEmbed()
                .setAuthor({
                    name: "Uh Oh!",
                    iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
                })
                .setTitle('Invalid arguments. Please use `g:autorole [enable/disable/setid] <role id>`!')

            const replyMessage = await message.reply({
                embeds: [cooldownError]
            });
            setTimeout(() => {
                message.delete();
                replyMessage.delete();
            }, 7500);
            return;
        }
        await db.close().catch(error => Logger.error(`Error closing database: ${error.message}`));
    },
};

async function enableAutorole(db, serverId) {
    try {
        await db.run(`INSERT INTO autorole (server_id, enabled, autorole_id) VALUES (?, ?, ?) ON CONFLICT(server_id) DO UPDATE SET enabled = 1`, [serverId, 1, '']);
    } catch (error) {
        console.error("Error enabling autorole:", error);
    }
}

async function disableAutorole(db, serverId) {
    try {
        await db.run(`INSERT INTO autorole (server_id, enabled, autorole_id) VALUES (?, ?, ?) ON CONFLICT(server_id) DO UPDATE SET enabled = 0`, [serverId, 0, '']);
    } catch (error) {
        console.error("Error disabling autorole:", error);
    }
}

async function setAutoroleId(db, serverId, roleId) {
    try {
        await db.run(`INSERT INTO autorole (server_id, enabled, autorole_id) VALUES (?, ?, ?) ON CONFLICT(server_id) DO UPDATE SET autorole_id = ?`, [serverId, 1, '', roleId]);
    } catch (error) {
        console.error("Error setting autorole ID:", error);
    }
}
