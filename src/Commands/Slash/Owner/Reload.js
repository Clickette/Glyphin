// src/Commands/Slash/Admin/reload.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { exec } = require('child_process');
const { ErrorEmbed, Embed } = require('@utils/Embed');
const Logger = require('@utils/Logger');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads the bot by pulling the latest changes and restarting.'),

    async execute(interaction) {
        // Load allowed user IDs from config.json
        const configPath = path.join(__dirname, '../../../Config/config.json');
        const configData = JSON.parse(fs.readFileSync(configPath));
        const devids = configData.devids;

        // Check if user is allowed to run the command
        if (!devids.includes(interaction.user.id)) {
            await interaction.reply({ content: 'You are not allowed to run this command.', ephemeral: true });
            return;
        }

        await interaction.reply('Reloading the bot...');

        // Pull the latest changes from the repository
        exec('git pull', (error, stdout, stderr) => {
            if (error) {
                Logger.error(`Error pulling changes: ${error.message}`);
                const errEmbed = new ErrorEmbed()
                    .setTitle('Error pulling changes')
                    .setDescription(`An error occurred while pulling the latest changes:\n${stderr}`);
                interaction.followUp({ embeds: [errEmbed] });
                return;
            }

            // Send confirmation message
            const embed = new Embed()
                .setTitle('Pull successful')
                .setDescription(`Latest changes pulled:\n${stdout}`);
            interaction.followUp({ embeds: [embed] });

            // Restart the bot
            const botProcess = require('child_process').spawn(
                process.argv[0],
                process.argv.slice(1),
                {
                    detached: true,
                    stdio: 'inherit',
                }
            );

            botProcess.unref();
            process.exit(0);
        });
    },
};
