const { Events } = require("discord.js");
const Logger = require('../Utilities/Logger.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		const { client } = interaction;
		if (!interaction.isChatInputCommand()) return;
		const command = client.slashCommands.get(interaction.commandName);
		if (!command) return;
		try {
			await command.execute(interaction);
		} catch (error) {
			Logger.error(error);
			await interaction.reply({
				content: "An error occured while attempting to execute this command! Please report this to the developers.",
				ephemeral: true,
			});
		}
	},
};