const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('statuspage')
		.setDescription('Create a live statuspage embed for your Atlassian Statuspage.'),
	async execute(interaction) {
		await interaction.reply('wip');
	},
};
