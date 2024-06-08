const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { Embed } = require('@utils/Embed');
const Logger = require('@utils/Logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Displays all available commands.'),
	async execute(interaction) {
        const categoriesDir = path.join(__dirname, '../../../Commands/Slash');
        const categories = fs.readdirSync(categoriesDir);

        const embed = new Embed()
            .setTitle('Here are the available commands!')
            .setImage("https://clickette.net/u/rK9qrh.webp");

        categories.forEach(category => {
            const commandFiles = fs.readdirSync(path.join(categoriesDir, category)).filter(file => file.endsWith('.js'));
            const capitalise = category.charAt(0).toUpperCase() + category.slice(1);

            try {
                const commands = commandFiles.map(file => {
                    const command = require(path.join(categoriesDir, category, file));
                    return command.data.name;
                });

                embed.addFields({ 
                    name: `<:arrowpoint:1248125837379768370> ${capitalise} [${commands.length}]:`, 
                    value: commands.map(name => '`' + name + '`').join(", "), 
                    inline: false 
                });
            } catch (error) {
                Logger.error(error);
            }
        });

        await interaction.reply({ embeds: [embed] });
	},
};
