const { REST, Client, Collection, GatewayIntentBits, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Logger = require('./Utilities/Logger.js');
const { token, clientid, guildid } = require('./Config/config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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

const loadCommands = (commandFolder, collection) => {
    for (const folder of commandFolder) {
        const commandFiles = loadFiles(path.join(__dirname, `Commands/Message/${folder}`), '.js');
        for (const file of commandFiles) {
            Logger.info(`Loading ${collection === client.messageCommands ? 'message' : 'slash'} command: ${file}`);
            const command = require(`./Commands/Message/${folder}/${file}`);
            collection.set(command.name, command);
        }
    }
};

const eventFiles = loadFiles(path.join(__dirname, 'Events'), '.js');
const messageCommandFolders = fs.readdirSync(path.join(__dirname, 'Commands/Message'));
const slashCommandFolders = fs.readdirSync(path.join(__dirname, 'Commands/Slash'));

loadEvents(eventFiles);
loadCommands(messageCommandFolders, client.messageCommands);

for (const module of slashCommandFolders) {
    const slashCommandFiles = loadFiles(path.join(__dirname, `Commands/Slash/${module}`), '.js');
    for (const file of slashCommandFiles) {
        Logger.info(`Loading slash command: ${file}`);
        const command = require(`./Commands/Slash/${module}/${file}`);
        client.slashCommands.set(command.data.name, command);
    }
}

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
