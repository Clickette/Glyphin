module.exports = {
	name: "womp",
	
	execute(message, args) {
		message.channel.send({ content: "womp womp" });
	},
};