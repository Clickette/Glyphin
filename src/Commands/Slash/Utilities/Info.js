const { SlashCommandBuilder } = require('discord.js');
const { Embed } = require('@utils/Embed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Provides information about a server, user, or the bot.')
        .addSubcommand(subcommand => 
            subcommand
                .setName('server')
                .setDescription('Get information about the server.'))
        .addSubcommand(subcommand => 
            subcommand
                .setName('user')
                .setDescription('Get information about a user.')
                .addUserOption(option => 
                    option.setName('target')
                    .setDescription('The user to get information about')))
        .addSubcommand(subcommand => 
            subcommand
                .setName('bot')
                .setDescription('Get information about the bot.')),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'server') {
                const server = interaction.guild;
                const owner = await server.fetchOwner();
                const roles = server.roles.cache.map(role => role.toString()).join(', ');
                const emojis = server.emojis.cache.map(emoji => emoji.toString()).join(' ');
                const embed = new Embed()
                    .setTitle('Server Info')
                    .setThumbnail(server.iconURL({ dynamic: true }))
                    .addFields(
                        { name: 'Server Name', value: server.name, inline: false },
                        { name: 'Server ID', value: server.id, inline: false },
                        { name: 'Member Count', value: server.memberCount.toString(), inline: false },
                        { name: 'Owner', value: `<@${owner.id}>`, inline: false },
                        { name: 'Created At', value: server.createdAt.toDateString(), inline: false },
                        { name: 'Roles', value: roles || 'No roles', inline: false },
                        { name: 'Emojis', value: emojis || 'No emojis', inline: false },
                    );

                await interaction.editReply({ embeds: [embed] });
            } else if (subcommand === 'user') {
                const user = interaction.options.getUser('target') || interaction.user;
                const member = interaction.guild.members.cache.get(user.id);
                const title = user.id === interaction.client.user.id ? 'User Info (try /info bot instead)' : 'User Info';
                
                if (user.id === interaction.client.user.id) {
                    await interaction.editReply({ content: 'Try using `/info bot` for information about the bot.' });
                    return;
                }
                
                const roles = member.roles.cache.map(role => role.toString()).join(', ');
                const permissions = member.permissions.toArray().join(', ');
                const embed = new Embed()
                    .setTitle(title)
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: 'Username', value: user.tag, inline: false },
                        { name: 'User ID', value: user.id, inline: false },
                        { name: 'Joined Server At', value: member.joinedAt.toDateString(), inline: false },
                        { name: 'Account Created At', value: user.createdAt.toDateString(), inline: false },
                        { name: 'Roles', value: roles || 'No roles', inline: false },
                        { name: 'Permissions', value: permissions || 'No permissions', inline: false },
                    );

                await interaction.editReply({ embeds: [embed] });
            } else if (subcommand === 'bot') {
                const botUser = interaction.client.user;
                const botMember = interaction.guild.members.cache.get(botUser.id);
                const botRoles = botMember.roles.cache.map(role => role.toString()).join(', ');

                const globalServerCount = interaction.client.guilds.cache.size;
                const globalUserCount = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

                const embed = new Embed()
                    .setTitle('Bot Info')
                    .setThumbnail(botUser.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: 'Bot Username', value: botUser.tag, inline: false },
                        { name: 'Bot ID', value: botUser.id, inline: false },
                        { name: 'Roles in this Server', value: botRoles || 'No roles', inline: false },
                        { name: 'Servers Count', value: globalServerCount.toString(), inline: false },
                        { name: 'Users Managed', value: globalUserCount.toString(), inline: false }
                    );

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            await interaction.editReply({ content: 'An error occurred while attempting to execute this command! Please report this to the developers.' });
        }
    },
};
