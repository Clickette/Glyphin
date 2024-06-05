const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('womp')
		.setDescription('womps twice'),
	async execute(interaction) {
		await interaction.reply('womp womp');
	},
};
