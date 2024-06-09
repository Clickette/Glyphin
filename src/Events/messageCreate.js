const { EmbedBuilder, Collection, ChannelType, Events } = require("discord.js");
const { prefix, devids } = require('@config/config.json');
const { version } = require('../../package.json');
const Logger = require("@utils/Logger");

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
                client.messageCommands.find(cmd => cmd.aliases?.includes(commandName));

        if (!command) return;

        if (command.ownerOnly && !devids.includes(author.id)) {
            const replyMessage = await message.reply({ content: "This command has been disabled by the developers." });
            setTimeout(() => {
                message.delete().catch(Logger.error);
                replyMessage.delete().catch(Logger.error);
            }, 7500);
            return;
        }

        if (command.guildOnly && message.channel.type === ChannelType.DM) {
            return message.reply({ content: "I can't execute that command inside DMs!" });
        }

        const permError = new EmbedBuilder()
            .setColor('#f80d22')
            .setAuthor({
                name: "Uh Oh!",
                iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
            })
            .setTitle('You do not have permission to use this command!')
            .setFooter({
                text: `Glyphin - v${version}`,
                iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
            })
            .setTimestamp()

        if (command.permissions && message.channel.type !== ChannelType.DM) {
            const authorPerms = message.channel.permissionsFor(author);
            if (!authorPerms?.has(command.permissions)) {
                const replyMessage = await message.reply({ embeds: [permError] });
                setTimeout(() => {
                    message.delete().catch(Logger.error);
                    replyMessage.delete().catch(Logger.error);
                }, 7500);
                return;
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

                const cooldownError = new EmbedBuilder()
                    .setColor('#f80d22')
                    .setAuthor({
                        name: "Uh Oh!",
                        iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
                    })
                    .setTitle(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the ${command.name} command!`)
                    .setFooter({
                        text: `Glyphin - v${version}`,
                        iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
                    })
                    .setTimestamp()

                const replyMessage = await message.reply({ embeds: [cooldownError] });
                setTimeout(() => {
                    message.delete().catch(Logger.error);
                    replyMessage.delete().catch(Logger.error);
                }, 10000);
                return;
            }
        }

        timestamps.set(author.id, now);
        setTimeout(() => timestamps.delete(author.id), cooldownAmount);

        try {
            await command.execute(message, args);
        } catch (error) {
            const genericError = new EmbedBuilder()
                .setColor('#f80d22')
                .setAuthor({
                    name: "Uh Oh!",
                    iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
                })
                .setTitle('An error occurred while attempting to execute this command!')
                .setDescription(`Please report this to the developers!\n\n<:line:1248940390589923328> Command : (\`${command.name}\`)\n<:line:1248940390589923328> Error : \`\`\`${error}\`\`\``)
                .setFooter({
                    text: `Glyphin - v${version}`,
                    iconURL: "https://cdn.discordapp.com/avatars/1247596819987300476/454d909eb9f0d11b670adb7a80a2b64e.webp?size=4096",
                })
            .setTimestamp()

            Logger.log(error);
            const replyMessage = await message.reply({ embeds: [genericError] });
            setTimeout(() => {
                message.delete().catch(Logger.error);
                replyMessage.delete().catch(Logger.error);
            }, 15000);
        }
    },
};
