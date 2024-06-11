const { create } = require('sourcebin');
const fetch = require('node-fetch');
const { Embed, ErrorEmbed } = require('@utils/Embed');
const path = require('path');

module.exports = {
    name: "sourcebin",
    description: "Lets you upload code snippets to sourcebin through Discord!",
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

        try {
            const fileContent = await fetch(attachment.url, { timeout: 15000 }).then(response => response.text());
            const fileExtension = path.extname(attachment.name).slice(1); // Get file extension without the dot

            create(
                {
                    title: `Code Snippet`,
                    description: `Code uploaded by ${message.author.username} using Glyphin.`,
                    files: [
                        {
                            content: fileContent,
                            language: fileExtension,
                        }
                    ]
                }
            ).then(value => {
                const embed = new Embed()
                    .setTitle('<:titlesuccess:1249439702608773170> Snippet uploaded!')
                    .setDescription(`<:line:1249439670954102905> You can **view your uploaded snippet** here: ${value.url}`)

                message.reply({ embeds: [embed] });
            }).catch(err => {
                console.error('Sourcebin upload error:', err);
                const errorEmbed = new ErrorEmbed()
                    .setTitle('Error uploading snippet')
                    .setDescription('There was an error uploading your snippet. Please try again later.');
                message.reply({ embeds: [errorEmbed] });
            });
        } catch (err) {
            console.error('Fetch error:', err);
            const errorEmbed = new ErrorEmbed()
                .setTitle('Error fetching file')
                .setDescription('There was an error fetching the file. Please make sure the attachment URL is correct and try again.');
            message.reply({ embeds: [errorEmbed] });
        }
    },
};
