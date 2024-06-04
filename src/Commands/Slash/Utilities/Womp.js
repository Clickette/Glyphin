const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('womp')
		.setDescription('womp womp'),
	async execute(interaction) {
		await interaction.reply('hi');
	},
};
