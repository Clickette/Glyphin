const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('@utils/Logger');
const { Embed, ErrorEmbed } = require('@utils/Embed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ginger')
        .setDescription('Sends a random picture of ginger!'),

    async execute(interaction) {
        const filePath = path.join(__dirname, '../../../Config/ginger.json');
        
        fs.readFile(filePath, 'utf8', async (err, data) => {
            if (err) {
                Logger.error(`Error reading ginger.json file: ${err.message}`);
                return;
            }

            const ginger = JSON.parse(data);
            const keys = Object.keys(ginger);
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            const selectedImage = ginger[randomKey];

            const gingerEmbed = new Embed()
                .setTitle(`<:arrowpoint:1248125837379768370> ${selectedImage.title}`)
                .setDescription('<:line:1248940390589923328> Pictures by **onion**/**robinet**\n<:line:1248940390589923328> [github](https://github.com/ROBlNET13), discord : `._onion._`')
                .setImage(selectedImage.url);

            await interaction.reply({ embeds: [gingerEmbed] }).catch(Logger.error);
        });
    },
};