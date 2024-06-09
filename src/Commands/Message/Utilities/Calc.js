const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    name: 'calc',
    description: 'A simple calculator using buttons.',
    cooldown: 5,

    async execute(message, args) {
        const calculatorButtons = [
            ['7', '8', '9', '÷'],
            ['4', '5', '6', '*'],
            ['1', '2', '3', '-'],
            ['0', '.', '=', '+'],
            ['Clear']
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

        const msg = await message.channel.send({ content: `\`\`\`${display}\`\`\``, components: rows });

        const filter = i => i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async i => {
            const buttonId = i.customId;

            if (buttonId === 'Clear') {
                currentExpression = '';
                display = '0';
            } else if (buttonId === '=') {
                try {
                    if (currentExpression.includes('/0')) {
                        throw new Error('division by zero');
                    }
                    currentExpression = eval(currentExpression.replace('÷', '/')).toString();
                    display = currentExpression;
                } catch (error) {
                    if (error.message === 'division by zero') {
                        currentExpression = '';
                        display = 'Why are you even trying to divide by zero?';
                    } else {
                        currentExpression = '';
                        display = 'Error';
                    }
                }
            } else {
                if (currentExpression === '0') {
                    currentExpression = buttonId;
                } else {
                    currentExpression += buttonId;
                }
                display = currentExpression;
            }

            await i.update({ content: `\`\`\`${display}\`\`\``, components: rows });
        });

        collector.on('end', async () => {
            try {
                await msg.edit({ components: [] });
            } catch (error) {
                console.error('Failed to edit message after collector ended:', error);
            }
        });
    },
};
