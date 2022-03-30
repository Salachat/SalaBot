import { MessageEmbed, TextChannel, Util } from "discord.js";
import { settings } from "../db.js";
import config from "../config.js";

/**
 * @param {import("discord.js").Client} client
 * @param {import("discord.js").Message} oldMessage
 * @param {import("discord.js").Message} newMessage
 */
export default async (client, oldMessage, newMessage) => {
    // Don't handle dms
    if (!oldMessage.guild) return;
    // Don't handle messages from self
    if (oldMessage.author.id === client.user.id) return;
    // Ensure and get settings for guild
    const gsettings = await settings.ensure(oldMessage.guild.id, config.defaultSettings);
    // Check if logging channel is set and edit logs are enabled
    if (gsettings.log === null || !gsettings.logs.edit) return;
    // Get the channel
    let channel;
    try {
        channel = await oldMessage.guild.channels.fetch(gsettings.log);
    } catch (e) {
        // Return if invalid channel
        return;
    }
    // Only log if message content has changed, we don't care about bot embeds or links
    if (oldMessage.content === newMessage.content) return;
    // Create an embed with all necessary information
    const embed = new MessageEmbed()
        .setAuthor({
            name: oldMessage.author.tag,
            iconURL: oldMessage.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
            `**Message Edited**\n**Channel:** ${oldMessage.channel} (\`${
                oldMessage.channel.id
            }\`)\n**Old**\n\`\`\`\n${
                Util.cleanCodeBlockContent(oldMessage.content) || "\u200b"
            }\n\`\`\`\n**New**\n\`\`\`\n${
                Util.cleanCodeBlockContent(newMessage.content) || "\u200b"
            }\n\`\`\``
        )
        .setColor("#2a97f7");
    // Check channel permissions
    if (
        !(channel instanceof TextChannel) ||
        !channel.permissionsFor(client.user).has(["SEND_MESSAGES", "EMBED_LINKS", "VIEW_CHANNEL"])
    )
        return;
    // And send the embed
    await channel.send({ embeds: [embed] });
};
