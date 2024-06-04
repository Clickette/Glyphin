const fs = require('fs');
const path = require('path');

module.exports = {
    name: "help",
    execute(message, args) {
        // Read the commands file
        fs.readFile(path.join(__dirname, '../../../Config/commands.json'), 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            // Parse the JSON
            const commands = JSON.parse(data);

            // Create a help message
            let helpMessage = 'Here are the available commands:\n';
            for (const command of commands) {
                helpMessage += `**${command.name}**: ${command.description}\n`;
            }

            // Send the help message
            message.channel.send({ content: helpMessage });
        });
    },
};