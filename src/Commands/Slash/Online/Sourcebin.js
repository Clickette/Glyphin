const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
const path = require('path');
const { create } = require('sourcebin');
const { Embed, ErrorEmbed } = require('@utils/Embed');
const Logger = require('@utils/Logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sourcebin')
        .setDescription('Lets you upload code snippets to sourcebin through Discord!')
        .addAttachmentOption(option => 
            option.setName('file')
                  .setDescription('The code file to upload')
                  .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply(); // Defer the reply to avoid interaction timeout

        const attachment = interaction.options.getAttachment('file');

        if (!attachment) {
            const cooldownError = new ErrorEmbed()
                .setAuthor({
                    name: "Uh Oh!",
                    iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
                })
                .setTitle('No file attached. Please attach a file to upload.');

            await interaction.editReply({ embeds: [cooldownError], ephemeral: true });
            return;
        }

        try {
            const fileContent = await fetch(attachment.url, { timeout: 15000 }).then(response => response.text());
            const fileExtension = path.extname(attachment.name).slice(1); // Get file extension without the dot

            create(
                {
                    title: `Code Snippet`,
                    description: `Code uploaded by ${interaction.user.username} using Glyphin.`,
                    files: [
                        {
                            content: fileContent,
                            language: fileExtension, // Use the file extension as the language
                        }
                    ]
                }
            ).then(value => {
                const embed = new Embed()
                    .setTitle('Snippet uploaded!')
                    .setDescription(`You can **view your uploaded snippet** here: ${value.url}`);

                interaction.editReply({ embeds: [embed] });
            }).catch(err => {
                Logger.error('Sourcebin upload error:', err);
                const errorEmbed = new ErrorEmbed()
                    .setTitle('Error uploading snippet')
                    .setDescription('There was an error uploading your snippet. Please try again later.');
                interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            });
        } catch (err) {
            Logger.error('Fetch error:', err);
            const errorEmbed = new ErrorEmbed()
                .setTitle('Error fetching file')
                .setDescription('There was an error fetching the file. Please make sure the attachment URL is correct and try again.');
            interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
