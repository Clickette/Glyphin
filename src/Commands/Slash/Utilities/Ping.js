const { SlashCommandBuilder } = require('discord.js');
const { Embed } = require('../../../Utilities/Embed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Displays the bot\'s and API\'s latency.'),
	async execute(interaction) {
        const embed = new Embed()
        .setTitle('🏓  Pong!')
        .addFields(
            {
              name: "<:bot:1248126559345442906> Bot Latency",
              value: `<:arrowpoint:1248125837379768370> \`${Date.now() - interaction.createdTimestamp}ms\``,
              inline: true
            },
            {
              name: "<:api:1248126556765949962> API Latency",
              value: `<:arrowpoint:1248125837379768370> \`${Math.round(interaction.client.ws.ping)}ms\``,
              inline: true
            },
        );

        await interaction.reply({ embeds: [embed] });
	},
};
