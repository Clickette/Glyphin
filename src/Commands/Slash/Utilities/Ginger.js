const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ginger')
        .setDescription('ginger'),
    async execute(interaction) {
        await interaction.reply({ content: 'https://media.discordapp.net/attachments/916342223572975737/1249029844583448637/20240310_195054.jpg?ex=6665d130&is=66647fb0&hm=826ff8ff4766bd40fac40e6d51b5146e642311b9f25bda9a58f9fdfdf79ba9c8&=&format=webp&width=507&height=676' });
    },
};
