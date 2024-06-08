const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { Embed } = require("@utils/Embed");
const Logger = require("@utils/Logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays all available commands.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("commands")
                .setDescription("Displays all available commands.")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("clickette")
                .setDescription(
                    "Tells you how to get your Clickette upload token"
                )
        ),
    async execute(interaction) {
        const command = interaction.options.getSubcommand();

        if (command === "commands") {
            const categoriesDir = path.join(
                __dirname,
                "../../../Commands/Slash"
            );
            const categories = fs.readdirSync(categoriesDir);

            const embed = new Embed()
                .setTitle("Here are the available commands!")
                .setImage("https://clickette.net/u/rK9qrh.webp");

            categories.forEach((category) => {
                const commandFiles = fs
                    .readdirSync(path.join(categoriesDir, category))
                    .filter((file) => file.endsWith(".js"));
                const capitalise =
                    category.charAt(0).toUpperCase() + category.slice(1);

                try {
                    const commands = commandFiles.map((file) => {
                        const command = require(path.join(
                            categoriesDir,
                            category,
                            file
                        ));
                        return command.data.name;
                    });

                    embed.addFields({
                        name: `<:arrowpoint:1248125837379768370> ${capitalise} [${commands.length}]:`,
                        value: commands
                            .map((name) => "`" + name + "`")
                            .join(", "),
                        inline: false,
                    });
                } catch (error) {
                    Logger.error(error);
                }
            });

            await interaction.reply({ embeds: [embed] });
        } else {
            // dm the user with the instructions (placeholder msg for now)
            await interaction.reply({
                content: "Check your DMs for instructions!",
                ephemeral: true,
            });
            await interaction.user.send({
                content:
                    "## To get your Clickette upload token, folow these instructions:\n1. Log in to [Clickette](https://clickette.net/auth/login?url=/dashboard)\n2. In the top-right corner, click on your username",
            });
            await interaction.user.send({
                content: "https://clickette.net/u/Phnd4B.png",
            });
            await interaction.user.send({
                content:
                    "3. In the dropdown menu, scroll down (if needed) and click on \"Copy Token\"",
            });
            await interaction.user.send({
                content: "https://clickette.net/u/LhxxQs.png",
            });
            await interaction.user.send({
                content:
                    "4. Paste the token in the `/upload` command and attach the file you want to upload",
            });
        }
    },
};
