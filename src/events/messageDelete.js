import { MessageEmbed, Util } from "discord.js";
import { settings } from "../db.js";
import config from "../config.js";

export default async (client, message) => {
    // Don't handle dms
    if (!message.guild) return;
    // Don't handle messages from self
    if (message.author.id === client.user.id) return;
    // Ensure and get settings for guild
    const gsettings = await settings.ensure(message.guild.id, config.defaultSettings);
    // Check if logging channel is set and delete logs are enabled
    if (gsettings.log === null || !gsettings.logs.delete) return;
    // Get the channel
    let channel;
    try {
        channel = await message.guild.channels.fetch(gsettings.log);
    } catch (e) {
        // Return if invalid channel
        return;
    }
    // Create an embed with all necessary information
    const embed = new MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
        .setDescription(
            `**Message Deleted**\n**Channel:** ${message.channel} (\`${message.channel.id}\`)\n${
                message.content.length > 0
                    ? `\`\`\`\n${Util.cleanCodeBlockContent(message.content)}\n\`\`\``
                    : ""
            }`
        )
        .setColor("f54242");
    // If the message had attachements
    if (message.attachments.size > 0) {
        // Add field with the names and proxy urls incase they are still cached
        embed.addField(
            "Cached attachments",
            message.attachments.map((v) => `[${v.name}](${v.proxyURL})`).join(" ")
        );
    }
    // Check channel permissions
    if (!channel.permissionsFor(client.user).has(["SEND_MESSAGES", "EMBED_LINKS", "VIEW_CHANNEL"]))
        return;
    // And send the embed
    await channel.send({ embeds: [embed] });
};
