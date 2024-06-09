const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Embed, ErrorEmbed } = require('@utils/Embed');
const { version } = require('../../../../package.json');

const Logger = require('@utils/Logger');
const Helper = require('@db/Helper');
const path = require('path');
const dbPath = path.join(__dirname, '../../../Database/Databases/punishments.db');
const db = new Helper(dbPath);
const timezone = "IST" // Put your server's local timezone in here

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cases')
        .setDescription('View punishment cases.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('View cases for a specific user.')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('The page number to display.')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        await interaction.deferReply();
        const user = interaction.options.getUser('user');
        let page = interaction.options.getInteger('page') || 1;
        const limit = 3; // Number of cases to display per page
        const offset = (page - 1) * limit;

        try {
            let cases;
            let totalCases;
            if (user) {
                const result = await db.all('SELECT * FROM logs WHERE server_id = ? AND user_id = ? ORDER BY timestamp DESC', [interaction.guild.id, user.id]);
                totalCases = result.data.length;
                cases = result.data.slice(offset, offset + limit);
            } else {
                const result = await db.all('SELECT * FROM logs WHERE server_id = ? ORDER BY timestamp DESC', [interaction.guild.id]);
                totalCases = result.data.length;
                cases = result.data.slice(offset, offset + limit);
            }

            if (!Array.isArray(cases) || cases.length === 0) {
                const noCasesEmbed = new ErrorEmbed()
                    .setTitle('No cases found')
                    .setDescription(user ? `No cases found for <@${user.id}>.` : 'No cases found.');
                await interaction.followUp({ embeds: [noCasesEmbed.toJSON()] });
                return;
            }

            const embeds = [];
            const caseChunks = [];

            for (const punishment of cases) {
                const formattedTimestamp = new Date(punishment.timestamp).toLocaleString();
                const caseField = {
                    name: `<:arrowpoint:1248125837379768370> Case ID: ${punishment.id}`,
                    value: `Punishment: ${punishment.punishment}\nUser: <@${punishment.user_id}>\nReason: ${punishment.reason}\nModerator: <@${punishment.moderator_id}>\nTimestamp: ${formattedTimestamp}`,
                    inline: false
                };
                caseChunks.push(caseField);
            }

            const embed = new Embed()
                .setTitle('Punishment Cases')
                .setTimestamp()
                .addFields(...caseChunks)
                .setFooter({
                    text: `Glyphin - v${version} - Time in ${timezone}`,
                    iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
                });
            embeds.push(embed.toJSON());

            const maxPages = Math.ceil(totalCases / limit);
            const prevButton = new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 1);

            const nextButton = new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === maxPages);

            const buttonRow = new ActionRowBuilder().addComponents(prevButton, nextButton);

            const msg = await interaction.followUp({ embeds, components: [buttonRow] });

            const filter = (i) => i.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (i) => {
                if (i.customId === 'prev') {
                    page = Math.max(1, page - 1);
                } else if (i.customId === 'next') {
                    page = Math.min(maxPages, page + 1);
                }

                const offset = (page - 1) * limit;
                if (user) {
                    const result = await db.all('SELECT * FROM logs WHERE server_id = ? AND user_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?', [interaction.guild.id, user.id, limit, offset]);
                    cases = result.data;
                } else {
                    const result = await db.all('SELECT * FROM logs WHERE server_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?', [interaction.guild.id, limit, offset]);
                    cases = result.data;
                }

                const caseChunks = [];
                for (const punishment of cases) {
                    const formattedTimestamp = new Date(punishment.timestamp).toLocaleString();
                    const caseField = {
                        name: `<:arrowpoint:1248125837379768370> Case ID: ${punishment.id}`,
                        value: `Punishment: ${punishment.punishment}\nUser: <@${punishment.user_id}>\nReason: ${punishment.reason}\nModerator: <@${punishment.moderator_id}>\nTimestamp: ${formattedTimestamp}`,
                        inline: false
                    };
                    caseChunks.push(caseField);
                }

                const embed = new Embed()
                    .setTitle('Punishment Cases')
                    .setTimestamp()
                    .addFields(...caseChunks)
                    .setFooter({
                        text: `Glyphin - v${version} - Time in ${timezone}`,
                        iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
                    });
                embeds[0] = embed.toJSON();

                prevButton.setDisabled(page === 1);
                nextButton.setDisabled(page === maxPages);

                await i.update({ embeds, components: [buttonRow] });
            });

        } catch (error) {
            Logger.error(`Error fetching punishment cases: ${error.message}`);
            const errEmbed = new ErrorEmbed()
                .setTitle('An error occurred while fetching the punishment cases!');
            await interaction.followUp({ embeds: [errEmbed.toJSON()] });
        }
    }
};