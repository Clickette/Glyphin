const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calculator')
        .setDescription('A simple calculator using buttons.'),
    async execute(interaction) {
        const calculatorButtons = [
            ['7', '8', '9', '÷'],
            ['4', '5', '6', '✖️'],
            ['1', '2', '3', '-'],
            ['0', '.', '=', '+'],
            ['C']
        ];

        const rows = calculatorButtons.map(row => {
            return new ActionRowBuilder().addComponents(
                row.map(label => 
                    new ButtonBuilder()
                        .setCustomId(label)
                        .setLabel(label)
                        .setStyle(ButtonStyle.Primary)
                )
            );
        });

        let display = '0';
        let currentExpression = '';

        await interaction.reply({ content: `\`\`\`${display}\`\`\``, components: rows });

        const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                await i.reply({ content: 'This calculator is not for you!', ephemeral: true });
                return;
            }

            const buttonId = i.customId;

            if (buttonId === 'C') {
                currentExpression = '';
                display = '0';
            } else if (buttonId === '=') {
                try {
                    currentExpression = eval(currentExpression).toString();
                    display = currentExpression;
                } catch (error) {
                    currentExpression = '';
                    display = 'Error';
                }
            } else {
                currentExpression += buttonId;
                display = currentExpression;
            }

            await i.update({ content: `\`\`\`${display}\`\`\`` });
        });

        collector.on('end', async () => {
            await interaction.editReply({ components: [] });
        });
    },
};
