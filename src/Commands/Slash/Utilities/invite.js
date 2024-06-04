const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get the invite link for the bot.'),
    async execute(interaction) {
        const inviteLink = 'https://discord.com/oauth2/authorize?client_id=1247596819987300476&permissions=8&scope=applications.commands+bot';
        const supportServerLink = 'https://dsc.gg/glyph'; // Replace with your support server invite link
        const websiteLink = 'https://glyphlabs.github.io'; // Replace with your GitHub repository link

        const embed = new EmbedBuilder()
            .setColor('#F8C822') // Custom yellow color
            .setTitle('Invite Glyph')
            .addFields([
                { name: 'About Glyph', value: 'A Powerful, Open-Source and Incredibly simple to use Discord bot for most of your needs.' }
            ])
            .setImage("https://media.discordapp.net/attachments/1247588047831437435/1247641355933581322/glyphin_embed_small.png?ex=6660c40f&is=665f728f&hm=6d2acb0014177fe245b90289be05e5dccf6aa48a299f66923079f04b0102c77f&=&format=webp&quality=lossless");

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Invite Bot')
                    .setStyle(ButtonStyle.Link)
                    .setURL(inviteLink),
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL(supportServerLink),
                new ButtonBuilder()
                    .setLabel('Website')
                    .setStyle(ButtonStyle.Link)
                    .setURL(websiteLink)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
