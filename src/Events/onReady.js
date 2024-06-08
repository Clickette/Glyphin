const { Events, ActivityType } = require("discord.js");
const Logger = require('@utils/Logger');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		Logger.info(`We're online! Logged in as user : ${client.user.tag}`);
		
		client.user.setPresence({
			activities: [{ name: '/help', type: ActivityType.Playing }],
			status: 'online',
		});
	},
};
