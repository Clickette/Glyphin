const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Make Glyphin say something')
        .addStringOption(option => 
            option.setName('input')
                .setDescription('The string to echo')
                .setRequired(true)),
    async execute(interaction) {
        const input = interaction.options.getString('input');
        await interaction.reply({ content: input });
    },
};