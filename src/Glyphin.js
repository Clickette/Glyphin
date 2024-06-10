require('module-alias/register');

const { REST, Client, Collection, GatewayIntentBits, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Logger = require('@utils/Logger');
const { token, clientid, guildid } = require('@config/config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.slashCommands = new Collection();
client.messageCommands = new Collection();
client.events = new Collection();
client.cooldowns = new Collection();

/**
 * Recursively loads files from a directory and filters them based on a given extension.
 * 
 * @param {string} directory - The directory to load files from.
 * @param {string} filter - The file extension to filter files by.
 * @returns {Array<string>} An array of file paths that match the filter.
 */
const loadFiles = (directory, filter) => {
    const fileList = [];
    const traverse = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                traverse(fullPath);
            } else if (fullPath.endsWith(filter)) {
                fileList.push(fullPath);
            }
        }
    };
    traverse(directory);
    return fileList;
};

/**
 * Loads and registers event handlers from the given list of event files.
 * 
 * @param {Array<string>} eventFiles - An array of file names representing the event files to load.
 * @returns {void} This function does not return anything.
 */
const loadEvents = (eventFiles) => {
    for (const file of eventFiles) {
        Logger.info(`Loading event: ${file}`);
        const event = require(file);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, async (...args) => await event.execute(...args, client));
        }
    }
};

/**
 * Loads and registers commands from the given list of command folders.
 * 
 * @param {Array<string>} commandFolders - An array of folder names representing the command folders to load.
 * @param {string} commandType - The type of command to load (either 'Message' or 'Slash').
 * @returns {void} This function does not return anything.
 */
const loadCommands = (commandFolders, commandType) => {
    for (const folder of commandFolders) {
        const commandFiles = loadFiles(path.join(__dirname, `Commands/${commandType}/${folder}`), '.js');
        for (const file of commandFiles) {
            Logger.info(`Loading ${commandType.toLowerCase()} command: ${file}`);
            const command = require(file);
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

/**
 * Registers slash commands with the Discord API.
 * 
 * @returns {Promise<void>} A promise that resolves when the slash commands have been registered.
 */
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