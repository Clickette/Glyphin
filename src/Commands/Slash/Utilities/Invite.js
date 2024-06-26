const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Embed } = require('@utils/Embed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get the invite link for the bot.'),
    async execute(interaction) {
        const inviteLink = 'https://discord.com/oauth2/authorize?client_id=1247596819987300476&permissions=8&scope=applications.commands+bot';
        const supportServerLink = 'https://dsc.gg/glyph';
        const websiteLink = 'https://glyphlabs.github.io';

        const embed = new Embed()
            .setTitle('Invite Glyph')
            .addFields([
                { name: 'About Glyph', value: 'A Powerful, Open-Source and Incredibly simple to use Discord bot for most of your needs.' },
                { name: 'Developers', value: '<@1244223146027122699> <@838197580462293042> <@722641444397121596>' },

                { name: 'Special Thanks', value: '<@819525284230594570>\'s cat, Ginger! \`/ginger\`' }
            ])
            .setImage("https://clickette.net/u/rK9qrh.webp");

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