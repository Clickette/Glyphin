const { SlashCommandBuilder } = require("discord.js");
const FormData = require("form-data");
const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("upload")
        .setDescription("Upload a file to Clickette.net")
        .addStringOption((option) =>
            option
                .setName("token")
                .setDescription(
                    'Your Clickette upload token (run "/help clickette" to find out how to get it)'
                )
                .setRequired(true)
        )
        .addAttachmentOption((option) =>
            option
                .setName("file")
                .setDescription("The file to upload")
                .setRequired(true)
        ),
    async execute(interaction) {
        console.log("Executing command");
        await interaction.deferReply({ ephemeral: true });
        const token = interaction.options.getString("token");
        const fileUrl = interaction.options.getAttachment("file").attachment;

        console.log(`Token: ${token}`);
        console.log(`File URL: ${fileUrl}`);

        // Download the file from Discord
        console.log("Downloading file from Discord");
        const fileResponse = await fetch(fileUrl);

        if (!fileResponse.ok) {
            console.log("Error downloading file");
            await interaction.editReply({
                content: `There was an error downloading your file.`,
                ephemeral: true,
            });
            return;
        }

        // File downloaded successfully
        console.log("File downloaded successfully");
        const fileBuffer = await fileResponse.buffer();

        // Create a Blob from the buffer
        const fileBlob = new Blob([fileBuffer], { type: 'application/octet-stream' });

        // Upload the file to your server
        console.log("Uploading file to server");
        const formData = new FormData();
        formData.append("file", fileBlob, "file");
        const response = await fetch("https://clickette.net/api/upload", {
            method: "POST",
            headers: {
                authorization: token,
            },
            body: formData,
        });
        const data = await response.json();
        console.log(`Server response: ${JSON.stringify(data)}`);
        if (!data.files || data.files.length === 0) {
            console.log("Error uploading file");
            await interaction.editReply({
                content: `There was an error uploading your file.`,
                ephemeral: true,
            });
            console.log(data);
        } else {
            console.log("File uploaded successfully");
            await interaction.editReply({
                content: `Your file has been uploaded to Clickette: ${data.files[0]}`,
                ephemeral: true,
            });
        }
    },
};