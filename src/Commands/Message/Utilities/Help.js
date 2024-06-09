const { ErrorEmbed } = require('@utils/Embed');

module.exports = {
    name: "help",
    description: 'Displays all available commands.',
    cooldown: 5,

    execute(message, args) {
        const embed = new ErrorEmbed()
            .setTitle('This command is deprecated. Please use the slash command `help` instead!')

        message.reply({ embeds: [embed] });
    },
};
