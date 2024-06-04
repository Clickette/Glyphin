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

            // Group the commands by category
            const categories = {};
            for (const command of commands) {
                if (!categories[command.category]) {
                    categories[command.category] = '';
                }
                categories[command.category] += `**${command.name}**: ${command.description}\n`;
            }

            // Create an embed message using EmbedBuilder
            const embed = new EmbedBuilder()
                .setColor('F8C923')
                .setTitle('Available Commands')
                .setImage("https://clickette.net/u/rK9qrh.webp");

            // Add a new field for each category
            for (const category in categories) {
                embed.addFields([
                    { name: category, value: categories[category] }
                ]);
            }

            // Send the embed message
            interaction.reply({ embeds: [embed] });
        });
    },
};