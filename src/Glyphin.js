const { REST, Client, Collection, GatewayIntentBits, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Logger = require('./Utilities/Logger.js');
const { token, clientid, guildid } = require('./Config/config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.slashCommands = new Collection();
client.messageCommands = new Collection();
client.events = new Collection();
client.cooldowns = new Collection();

const loadFiles = (directory, filter) => fs.readdirSync(directory).filter((file) => file.endsWith(filter));

const loadEvents = (eventFiles) => {
    for (const file of eventFiles) {
        Logger.info(`Loading event: ${file}`);
        const event = require(`./Events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, async (...args) => await event.execute(...args, client));
        }
    }
};

const loadCommands = (commandFolders, commandType) => {
    for (const folder of commandFolders) {
        const commandFiles = loadFiles(path.join(__dirname, `Commands/${commandType}/${folder}`), '.js');
        for (const file of commandFiles) {
            Logger.info(`Loading ${commandType.toLowerCase()} command: ${file}`);
            const command = require(`./Commands/${commandType}/${folder}/${file}`);
            if (commandType === 'Message') {
                client.messageCommands.set(command.name, command);
            } else {
                client.slashCommands.set(command.data.name, command);
            }
        }
    }
};

const eventFiles = loadFiles(path.join(__dirname, 'Events'), '.js');
const messageCommandFolders = fs.readdirSync(path.join(__dirname, 'Commands/Message'));
const slashCommandFolders = fs.readdirSync(path.join(__dirname, 'Commands/Slash'));

loadEvents(eventFiles);
loadCommands(messageCommandFolders, 'Message');
loadCommands(slashCommandFolders, 'Slash');

const rest = new REST({ version: '9' }).setToken(token);
const slashCommands = client.slashCommands.map((command) => command.data.toJSON());

(async () => {
    try {
        Logger.info('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationGuildCommands(clientid, guildid), { body: slashCommands });
        // Uncomment the following line for global command registration after testing
        // await rest.put(Routes.applicationCommands(clientid), { body: slashCommands });
        Logger.info('Successfully reloaded application (/) commands.');
    } catch (error) {
        Logger.error(error);
    }
})();

client.login(token);
