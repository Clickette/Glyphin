const { Collection, ChannelType, Events } = require("discord.js");
const { prefix, owner } = require('../Config/config.json');
const Logger = require("../Utilities/Logger");

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        const { client, content, author } = message;

        if (author.bot) return;
        
        if (content === `<@${client.user.id}>` || content === `<@!${client.user.id}>`) {
            return message.channel.send(`Use slash commands, or use \`g:\` if you don't want to use slash commands.`);
        }

        const checkPrefix = prefix.toLowerCase();
        const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(checkPrefix)})\\s*`);

        if (!prefixRegex.test(content.toLowerCase())) return;

        const [matchedPrefix] = content.toLowerCase().match(prefixRegex);
        const args = content.slice(matchedPrefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        const command = client.messageCommands.get(commandName) || 
                        client.messageCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        if (command.ownerOnly && author.id !== owner) {
            return message.reply({ content: "This is an owner-only command!" });
        }

        if (command.guildOnly && message.channel.type === ChannelType.DM) {
            return message.reply({ content: "I can't execute that command inside DMs!" });
        }

        if (command.permissions && message.channel.type !== ChannelType.DM) {
            const authorPerms = message.channel.permissionsFor(author);
            if (!authorPerms || !authorPerms.has(command.permissions)) {
                return message.reply({ content: "You do not have permission to execute this command!" });
            }
        }

        if (command.args && !args.length) {
            let reply = `You didn't provide any arguments, ${author}!`;
            if (command.usage) {
                reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
            }
            return message.channel.send({ content: reply });
        }

        const now = Date.now();
        const timestamps = client.cooldowns.get(command.name) || new Collection();
        client.cooldowns.set(command.name, timestamps);

        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(author.id)) {
            const expirationTime = timestamps.get(author.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply({ content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.` });
            }
        }

        timestamps.set(author.id, now);
        setTimeout(() => timestamps.delete(author.id), cooldownAmount);

        try {
            await command.execute(message, args);
        } catch (error) {
            Logger.error(error);
            message.reply({ content: "An error occurred while attempting to execute this command! Please report this to the developers." });
        }
    },
};
