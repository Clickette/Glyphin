const { Events } = require("discord.js");
const Logger = require('../Utilities/Logger.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		Logger.info(`Hello World! Logged in as user : ${client.user.tag}`);
	},
};