const { EmbedBuilder } = require('discord.js');
const { version } = require('../../package.json');

function Embed() {
    const embed = new EmbedBuilder()
        .setColor('#F8C822')
        .setImage('https://media.discordapp.net/attachments/1247588047831437435/1247641355933581322/glyphin_embed_small.png?ex=6660c40f&is=665f728f&hm=6d2acb0014177fe245b90289be05e5dccf6aa48a299f66923079f04b0102c77f&format=webp&quality=lossless&')
        .setFooter({
            text: `Glyph - v${version}`,
            iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
        })
        .setTimestamp()
    return embed;
}

module.exports = { Embed };
