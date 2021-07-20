import { MessageEmbed } from "discord.js";
import { settings } from "../db.js";
import config from "../config.js";

export default async (client, messages) => {
    // Don't handle dms
    if (!messages.first().guild) return;
    // Ensure and get settings for guild
    const gsettings = await settings.ensure(messages.first().guild.id, config.defaultSettings);
    // Check if logging channel is set and delete logs are enabled
    if (gsettings.log === null || !gsettings.logs.delete) return;
    // Get the channel
    let channel;
    try {
        channel = await messages.first().guild.channels.fetch(gsettings.log);
    } catch (e) {
        // Return if invalid channel
        return;
    }
    // create an embed with all necessary information
    const embed = new MessageEmbed()
        .setTitle("Bulk Message Delete")
        .setDescription(
            `${messages.size} messages were deleted in ${messages.first().channel} \`${
                messages.first().channel.id
            }\``
        )
        .setColor("f54242");
    let content = "";
    // Loop deleted messages
    messages
        // Sort by time
        .sorted((a, b) => a.createdTimestamp - b.createdTimestamp)
        .forEach((m) => {
            // Format attachments
            const attachments = m.attachments
                ? `\n${m.attachments.map((a) => a.proxyURL).join("\n")}`
                : "";
            // Format headers
            content += `${m.author.tag} at ${m.createdAt.toLocaleString("en-GB", {
                timeZone: "UTC",
            })} UTC\n`;
            // Add content and attachements
            content += m.content;
            content += attachments;
            content += "\n\n";
        });
    // Create a file from all the message data
    const file = Buffer.from(content, "utf-8");
    // Check channel permissions
    if (!channel.permissionsFor(client.user).has(["SEND_MESSAGES", "EMBED_LINKS", "VIEW_CHANNEL"]))
        return;
    // Send the embed and logs
    await channel.send({
        embeds: [embed],
        files: [
            {
                name: "messages.txt",
                attachment: file,
            },
        ],
    });
};
