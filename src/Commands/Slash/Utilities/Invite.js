const { SlashCommandBuilder } = require('discord.js');
const { Embed } = require('@utils/Embed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Provides information about a server or user.')
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
                    .setDescription('The user to get information about'))),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'server') {
                const server = interaction.guild;
                const owner = await server.fetchOwner();
                const roles = server.roles.cache.map(role => `<@&${role.id}>`).join(', ');
                const emojis = server.emojis.cache.map(emoji => emoji.toString()).join(' ');
                const embed = new Embed()
                    .setTitle('Server Info')
                    .setThumbnail(server.iconURL({ dynamic: true }))
                    .setImage('https://clickette.net/u/rK9qrh.webp')
                    .addFields(
                        { name: '<:arrowpoint:1248125837379768370> Server Name', value: server.name, inline: true },
                        { name: '<:arrowpoint:1248125837379768370> Member Count', value: server.memberCount.toString(), inline: true },
                        { name: '<:arrowpoint:1248125837379768370> Server ID', value: server.id, inline: false },
                        { name: '<:arrowpoint:1248125837379768370> Owner', value: `<@${owner.id}>`, inline: true },
                        { name: '<:arrowpoint:1248125837379768370> Created At', value: server.createdAt.toDateString(), inline: true },
                        { name: '<:arrowpoint:1248125837379768370> Roles', value: roles || 'No roles', inline: false },
                        { name: '<:arrowpoint:1248125837379768370> Emojis', value: emojis || 'No emojis', inline: false },
                    );

                await interaction.editReply({ embeds: [embed] });
            } else if (subcommand === 'user') {
                const user = interaction.options.getUser('target') || interaction.user;
                const member = interaction.guild.members.cache.get(user.id);
                const title = user.id === '1246931377828663307' ? 'User Info (worse version of me fr)' : 'User Info';
                const roles = member.roles.cache.map(role => `<@&${role.id}>`).join(', ');
                const embed = new Embed()
                    .setTitle(title)
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .setImage('https://clickette.net/u/rK9qrh.webp')
                    .addFields(
                        { name: '<:arrowpoint:1248125837379768370> Username', value: user.tag, inline: false },
                        { name: '<:arrowpoint:1248125837379768370> User ID', value: user.id, inline: false },
                        { name: '<:arrowpoint:1248125837379768370> Joined Server At', value: member.joinedAt.toDateString(), inline: false },
                        { name: '<:arrowpoint:1248125837379768370> Account Created At', value: user.createdAt.toDateString(), inline: false },
                        { name: '<:arrowpoint:1248125837379768370> Roles', value: roles || 'No roles', inline: false },
                    );

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            await interaction.editReply({ content: 'An error occurred while attempting to execute this command! Please report this to the developers.' });
        }
    },
};
