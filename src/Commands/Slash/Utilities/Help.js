const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of commands'),
    async execute(interaction) {
        // Read the commands file
        fs.readFile(path.join(__dirname, '../../../Config/commands.json'), 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            // Parse the JSON
            const commands = JSON.parse(data);

            // Create a help message
            let helpMessage = 'Here are the available commands:\n';
            if (commands && commands.length > 0) {
                for (const command of commands) {
                    if (typeof command.description === 'string') {
                        helpMessage += `**${command.name}**: ${command.description}\n`;
                    }
                }
            } else {
                helpMessage += 'No commands found.';
            }

            // Create an embed message using EmbedBuilder
            const embed = new EmbedBuilder();
            embed.setColor('F8C923');
            embed.setTitle('Help');
            embed.setDescription(helpMessage); // Set the description to the help message
            embed.setImage('https://media.discordapp.net/attachments/1247588047831437435/1247641355933581322/glyphin_embed_small.png?ex=6660c40f&is=665f728f&hm=6d2acb0014177fe245b90289be05e5dccf6aa48a299f66923079f04b0102c77f&format=webp&quality=lossless&');

            // Send the embed message
            interaction.reply({ embeds: [embed] });
        });
    },
};