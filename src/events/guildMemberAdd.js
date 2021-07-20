import { MessageEmbed } from "discord.js";
import { settings } from "../db.js";
import config from "../config.js";

export default async (client, member) => {
    // Ensure and get settings for guild
    const gsettings = await settings.ensure(member.guild.id, config.defaultSettings);
    // Check if logging channel is set and join logs are enabled
    if (gsettings.log === null || !gsettings.logs.join) return;
    // Get the channel
    let channel;
    try {
        channel = await member.guild.channels.fetch(gsettings.log);
    } catch (e) {
        // Return if invalid channel
        return;
    }
    // Create an embed with all necessary information
    const embed = new MessageEmbed()
        .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
        .setDescription(
            `**Joined**\n**ID:** \`${member.id}\`\n**Joined Discord:** <t:${Math.round(
                member.user.createdTimestamp / 1000
            )}> (<t:${Math.round(member.user.createdTimestamp / 1000)}:R>)`
        )
        .setColor("34a2eb");
    // Check channel permissions
    if (!channel.permissionsFor(client.user).has(["SEND_MESSAGES", "EMBED_LINKS", "VIEW_CHANNEL"]))
        return;
    // And send the embed
    await channel.send({ embeds: [embed] });
};
