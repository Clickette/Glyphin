const { EmbedBuilder } = require('discord.js');
const { version } = require('../../package.json');

/**
 * Creates a new EmbedBuilder instance with default settings.
 *
 * @return {EmbedBuilder} The newly created EmbedBuilder instance.
 */
function Embed() {
    const embed = new EmbedBuilder()
        .setColor('#F8C822')
        .setFooter({
            text: `Glyphin - v${version}`,
            iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
        })
        .setTimestamp()
    return embed;
}

/**
 * Creates an error embed with a default error message.
 *
 * @return {EmbedBuilder} The error embed.
 */
function ErrorEmbed() {
    const embed = new EmbedBuilder()
        .setColor('#f80d22')
        .setAuthor({
            name: "Uh Oh!",
            iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
        })
        .setFooter({
            text: `Glyphin - v${version}`,
            iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
        })
        .setTimestamp()
    return embed;
}

/**
 * Converts JSON data (from https://discohook.org/) into an embed.
 *
 * @param {Object} DiscoHookJson - The Discord webhook JSON object.
 * @return {Discord.EmbedBuilder[]} The converted Discord.js Embed object.
 */
function dishkToEmbed(DiscoHookJson) {
    const embeds = DiscoHookJson.embeds.map(dishk => {
        const embed = new Embed();

        if (dishk.title) embed.setTitle(dishk.title);
        if (dishk.description) embed.setDescription(dishk.description);
        
        if (dishk.color) {
            const hexColor = dishk.color.toString(16).padStart(6, '0');
            embed.setColor(hexColor);
        } else {
            embed.setColor('#F8C822');
        }

        if (dishk.fields && dishk.fields.length > 0) {
            dishk.fields.forEach(field => {
                embed.addFields({ name: field.name, value: field.value, inline: field.inline || false });
            });
        }

        if (dishk.author?.name) {
            embed.setAuthor({ name: dishk.author.name });
        }

        if (dishk.timestamp) {
            embed.setTimestamp(new Date(dishk.timestamp));
        }

        return embed;
    });

    return embeds;
}

module.exports = { Embed, ErrorEmbed , dishkToEmbed };
