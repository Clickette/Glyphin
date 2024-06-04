const { Collection, ChannelType, Events } = require("discord.js");
const { prefix, owner } = require('../Config/config.json');
const Logger = require("../Utilities/Logger");

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const handleMention = (message) => {
    const { client, channel, content } = message;
    if (content === `<@${client.user.id}>` || content === `<@!${client.user.id}>`) {
        return channel.send(`Use slash commands, or use \`g:\` if you don't want to use slash commands.`);
    }
};

const hasValidPrefix = (content, prefixRegex) => prefixRegex.test(content.toLowerCase());

const getCommandAndArgs = (content, matchedPrefix) => {
    const args = content.slice(matchedPrefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();
    return { commandName, args };
};

const isCommandValid = (command, message, owner) => {
    if (command.ownerOnly && message.author.id !== owner) {
        message.reply({ content: "This is an owner-only command!" });
        return false;
    }

    if (command.guildOnly && message.channel.type === ChannelType.DM) {
        message.reply({ content: "I can't execute that command inside DMs!" });
        return false;
    }

    if (command.permissions && message.channel.type !== ChannelType.DM) {
        const authorPerms = message.channel.permissionsFor(message.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
            message.reply({ content: "You do not have permission to execute this command!" });
            return false;
        }
    }

    if (command.args && !message.args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }
        message.channel.send({ content: reply });
        return false;
    }

    return true;
};

const handleCooldowns = (command, message, now) => {
    const { cooldowns } = message.client;

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Collection());
    }

    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            message.reply({
                content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`,
            });
            return false;
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    return true;
};

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        const { client, content, author } = message;

        if (author.bot) return;
        
        handleMention(message);

        const checkPrefix = prefix.toLowerCase();
        const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(checkPrefix)})\\s*`);

        if (!hasValidPrefix(content, prefixRegex)) return;

        const [matchedPrefix] = content.toLowerCase().match(prefixRegex);
        const { commandName, args } = getCommandAndArgs(content, matchedPrefix);

        const command = client.commands.get(commandName) || 
                        client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        message.args = args;

        if (!isCommandValid(command, message, owner)) return;

        const now = Date.now();

        if (!handleCooldowns(command, message, now)) return;

        try {
            command.execute(message, args);
        } catch (error) {
            Logger.error(error);
            message.reply({ content: "An error occurred while attempting to execute this command! Please report this to the developers." });
        }
    },
};
