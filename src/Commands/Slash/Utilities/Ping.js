const { SlashCommandBuilder } = require('discord.js');
const { Embed } = require('../../../Utilities/Embed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Displays the bot\'s and API\'s latency.'),
	async execute(interaction) {
        const embed = new Embed()
        .setTitle('Pong!')
        .addFields(
            {
              name: "🤖 • Bot Latency",
              value: `\`${Date.now() - interaction.createdTimestamp}ms\``,
              inline: true
            },
            {
              name: "💻 • API Latency",
              value: `\`${Math.round(interaction.client.ws.ping)}ms\``,
              inline: true
            },
        );

        await interaction.reply({ embeds: [embed] });
	},
};
