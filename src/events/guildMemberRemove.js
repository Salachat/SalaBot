import { MessageEmbed } from "discord.js";
import { settings } from "../db.js";
import config from "../config.js";

export default async (client, member) => {
    // Ensure and get settings for guild
    const gsettings = await settings.ensure(member.guild.id, config.defaultSettings);
    // Check if logging channel is set and leave logs are enabled
    if (gsettings.log === null || !gsettings.logs.leave) return;
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
            `**Left**\n**ID:** \`${member.id}\`\n**Joined Server:** <t:${Math.round(
                member.joinedTimestamp / 1000
            )}> (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)`
        )
        .setColor("c634eb");
    // Check channel permissions
    if (!channel.permissionsFor(client.user).has(["SEND_MESSAGES", "EMBED_LINKS", "VIEW_CHANNEL"]))
        return;
    // And send the embed
    await channel.send({ embeds: [embed] });
};
