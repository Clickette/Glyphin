const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('instatus')
		.setDescription('Create a live statuspage embed for your Instatus.'),
	async execute(interaction) {
		await interaction.reply('wip');
	},
};
