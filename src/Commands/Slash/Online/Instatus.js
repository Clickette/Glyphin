const { SlashCommandBuilder } = require('@discordjs/builders');
const { Embed, ErrorEmbed } = require('@utils/Embed');
const Logger = require('@utils/Logger');
const Helper = require('@db/Helper');
const fetch = require('node-fetch');
const path = require('path');

const dbPath = path.join(__dirname, '../../../Database/Databases/statuspage.db');
const db = new Helper(dbPath);

db.run(`
    CREATE TABLE IF NOT EXISTS instatus (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id TEXT NOT NULL,
        server_id TEXT NOT NULL,
        instatus_url TEXT NOT NULL
    )
`).catch(err => Logger.error(`Error creating table: ${err.message}`));

// does not apply to active maintenances/incidents
const statusTextMapping = {
    OPERATIONAL: '<:online:1249701975960981525> Operational',
    UNDERMAINTENANCE: '<:maintanence:1249701974132129903> Maintenance',
    HASISSUES: '<:issues:1249701971703894018> Issues',
    PARTIALOUTAGE: '<:minoroutage:1249701969443029084> Partial Outage',
    MAJOROUTAGE: '<:majoroutage:1249701962526756998> Major Outage',
    DEGRADEDPERFORMANCE: '<:degraded:1249705459288637460> Low Performance'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('instatus')
        .setDescription('Auto-Updating embed for your Instatus page.')
        .addStringOption(option => 
            option.setName('url')
                .setDescription('The Instatus URL to fetch data from')
                .setRequired(true)),

    async execute(interaction) {
        const url = interaction.options.getString('url');
        const serverId = interaction.guild.id;
        const componentsUrl = `${url}/v2/components.json`;
        const summaryUrl = `${url}/summary.json`;

        try {
            const componentsResponse = await fetch(componentsUrl);
            if (!componentsResponse.ok) {
                throw new Error(`HTTP error! status: ${componentsResponse.status}`);
            }
            const componentsData = await componentsResponse.json();

            const summaryResponse = await fetch(summaryUrl);
            if (!summaryResponse.ok) {
                throw new Error(`HTTP error! status: ${summaryResponse.status}`);
            }
            const summaryData = await summaryResponse.json();

            const pageStatus = summaryData.page.status;
            const embedColor = getStatusColor(pageStatus);
            const statusText = statusTextMapping[pageStatus] || pageStatus;

            const embed = new Embed().setTitle('Service Status').setColor(embedColor);

            if (Array.isArray(componentsData.components)) {
                componentsData.components.forEach(component => {
                    const componentStatusText = statusTextMapping[component.status] || component.status;
                    embed.addFields({
                        name: `${component.name}`,
                        value: `${componentStatusText}\n*${component.description || 'No description'}*`,
                        inline: true
                    });
                });
            } else {
                throw new Error('Invalid data structure for components.json');
            }

            const page = summaryData.page;
            let description = `## ${statusText}\n\n`;
            
            if (Array.isArray(summaryData.activeIncidents) && summaryData.activeIncidents.length > 0) {
                description += '### Active Incidents\n';
                description += summaryData.activeIncidents.map(incident => 
                    `[${incident.name}](${incident.url})\n<:line:1249439670954102905> Status: ${incident.status}\n<:line:1249439670954102905> Impact: ${incident.impact}`).join('\n');
                description += '\n';
            }

            if (Array.isArray(summaryData.activeMaintenances) && summaryData.activeMaintenances.length > 0) {
                description += '### Active Maintenances\n';
                description += summaryData.activeMaintenances.map(maintenance => 
                    `[${maintenance.name}](${maintenance.url})\n<:line:1249439670954102905> Status: ${maintenance.status}\n<:line:1249439670954102905> Duration: ${maintenance.duration} mins`).join('\n');
            }

            embed.setDescription(description);

            const replyMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

            await db.run(`
                INSERT INTO instatus (message_id, server_id, instatus_url) 
                VALUES (?, ?, ?)`,
                [replyMessage.id, serverId, url]
            ).catch(err => Logger.error(`Error logging status message: ${err.message}`));

        } catch (error) {
            Logger.error(`Error fetching status: ${error.message}`);

            const errEmbed = new ErrorEmbed()
                .setTitle('Error fetching status')
                .setDescription(error.message);

            await interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }
    },
};

function getStatusColor(status) {
    switch (status) {
        case 'OPERATIONAL':
            return '#00FF4C';
        case 'UNDERMAINTENANCE':
            return '#9C9C9C';
        case 'HASISSUES':
            return '#FFB806';
        case 'PARTIALOUTAGE':
            return '#FF5D06';
        case 'MAJOROUTAGE':
            return '#FF0000';
        default:
            return '#808080';
    }
}
