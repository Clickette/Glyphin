const { Embed, ErrorEmbed } = require('@utils/Embed');

module.exports = {
    name: 'info',
    description: 'Provides information about a server, user, or the bot.',
    usage: 'info [server|user|bot] <@user>',
    cooldown: 5,

    async execute(message, args) {
        const subcommand = args[0];

        if (!subcommand) {
            const cooldownError = new ErrorEmbed()
                .setAuthor({
                    name: "Uh Oh!",
                    iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
                })
                .setTitle('Missing arguments. Please use  `g:info [server/user/bot] <@user>`!')

            const replyMessage = await message.reply({ embeds: [cooldownError] });
            setTimeout(() => {
                message.delete();
                replyMessage.delete();
            }, 7500);
            return;
        }

        if (subcommand === 'server') {
            const server = message.guild;
            const owner = await server.fetchOwner();
            const roles = server.roles.cache.map(role => role.toString()).join(', ');
            const emojis = server.emojis.cache.map(emoji => emoji.toString()).join(' ');
            const embed = new Embed()
                .setTitle('Server Info')
                .setThumbnail(server.iconURL({
                    dynamic: true
                }))
                .addFields({
                    name: 'Server Name',
                    value: server.name,
                    inline: false
                }, {
                    name: 'Server ID',
                    value: server.id,
                    inline: false
                }, {
                    name: 'Member Count',
                    value: server.memberCount.toString(),
                    inline: false
                }, {
                    name: 'Owner',
                    value: `<@${owner.id}>`,
                    inline: false
                }, {
                    name: 'Created At',
                    value: server.createdAt.toDateString(),
                    inline: false
                }, {
                    name: 'Roles',
                    value: roles || 'No roles',
                    inline: false
                }, {
                    name: 'Emojis',
                    value: emojis || 'No emojis',
                    inline: false
                }, );

            await message.channel.send({
                embeds: [embed]
            });
        } else if (subcommand === 'user') {
            const user = message.mentions.users.first() || message.author;
            const member = message.guild.members.cache.get(user.id);
            const title = user.id === message.client.user.id ? 'User Info (try info bot instead)' : 'User Info';

            if (user.id === message.client.user.id) {
                await message.channel.send('Try using `info bot` for information about the bot.');
                return;
            }

            const roles = member.roles.cache.map(role => role.toString()).join(', ');
            const permissions = member.permissions.toArray().join(', ');
            const embed = new Embed()
                .setTitle(title)
                .setThumbnail(user.displayAvatarURL({
                    dynamic: true
                }))
                .addFields({
                    name: 'Username',
                    value: user.tag,
                    inline: false
                }, {
                    name: 'User ID',
                    value: user.id,
                    inline: false
                }, {
                    name: 'Joined Server At',
                    value: member.joinedAt.toDateString(),
                    inline: false
                }, {
                    name: 'Account Created At',
                    value: user.createdAt.toDateString(),
                    inline: false
                }, {
                    name: 'Roles',
                    value: roles || 'No roles',
                    inline: false
                }, {
                    name: 'Permissions',
                    value: permissions || 'No permissions',
                    inline: false
                }, );

            await message.channel.send({
                embeds: [embed]
            });
        } else if (subcommand === 'bot') {
            const botUser = message.client.user;
            const botMember = message.guild.members.cache.get(botUser.id);
            const botRoles = botMember.roles.cache.map(role => role.toString()).join(', ');

            const globalServerCount = message.client.guilds.cache.size;
            const globalUserCount = message.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

            const embed = new Embed()
                .setTitle('Bot Info')
                .setThumbnail(botUser.displayAvatarURL({
                    dynamic: true
                }))
                .addFields({
                    name: 'Bot Username',
                    value: botUser.tag,
                    inline: false
                }, {
                    name: 'Bot ID',
                    value: botUser.id,
                    inline: false
                }, {
                    name: 'Roles in this Server',
                    value: botRoles || 'No roles',
                    inline: false
                }, {
                    name: 'Servers Count',
                    value: globalServerCount.toString(),
                    inline: false
                }, {
                    name: 'Users Managed',
                    value: globalUserCount.toString(),
                    inline: false
                });

            await message.channel.send({
                embeds: [embed]
            });
        } else {
            const cooldownError = new ErrorEmbed()
                    .setAuthor({
                        name: "Uh Oh!",
                        iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
                    })
                    .setTitle('Invalid subcommand. Please use `server`, `user`, or `bot`!')

            const replyMessage = await message.reply({ embeds: [cooldownError] });
            setTimeout(() => {
                message.delete();
                replyMessage.delete();
            }, 7500);
        }
    },
};
