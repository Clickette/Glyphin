const { Embed } = require('@utils/Embed');

module.exports = {
    name: "ping",
    description: 'Displays the bot\'s and API\'s latency.',
    cooldown: 5,

    execute(message, args) {
        const embed = new Embed()
            .setTitle('🏓  Pong!')
            .addFields(
                {
                    name: "<:bot:1248126559345442906> Bot Latency",
                    value: `<:arrowpoint:1248125837379768370> \`${Date.now() - message.createdTimestamp}ms\``,
                    inline: true
                },
                {
                    name: "<:api:1248126556765949962> API Latency",
                    value: `<:arrowpoint:1248125837379768370> \`${Math.round(message.client.ws.ping)}ms\``,
                    inline: true
                },
            );

        message.reply({ embeds: [embed] });
    },
};
