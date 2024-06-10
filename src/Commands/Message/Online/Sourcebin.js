const { create } = require('sourcebin');
const fetch = require('node-fetch');
const { Embed, ErrorEmbed } = require('@utils/Embed');

module.exports = {
    name: "sourcebin",
    description: "Lets you upload javascript snippets to sourcebin through Discord!",
    usage: '[code file]',
    cooldown: 30,
    
    async execute(message, args) {
        if (!message.attachments.first()) {
            const cooldownError = new ErrorEmbed()
                .setAuthor({
                    name: "Uh Oh!",
                    iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
                })
                .setTitle('No file attached. Please attach a file to upload.')

            const replyMessage = await message.reply({
                embeds: [cooldownError]
            });
            setTimeout(() => {
                message.delete();
                replyMessage.delete();
            }, 7500);
            return;
        }

        const attachment = message.attachments.first();
        const fileContent = await fetch(attachment.url).then(response => response.text());
        create(
            {
                title: `JS Snippet`,
                description: `Code uploaded by ${message.author.username} using Glyphin.`,
                files: [
                    {
                        content: fileContent,
                        language: 'javascript',
                    }
                ]
            }
        ).then(value => {
            const embed = new Embed()
                .setTitle('<:titlesuccess:1249439702608773170> Snippet uploaded!')
                .setDescription(`<:line:1249439670954102905> You can **view your uploaded snippet** here: ${value.url}`)

            message.reply({ embeds: [embed] });
        });
    },
};
