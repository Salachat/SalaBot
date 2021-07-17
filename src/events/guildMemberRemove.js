import { MessageEmbed } from "discord.js";
import { settings } from "../db.js";
import config from "../config.js";

export default async (client, member) => {
    const gsettings = await settings.ensure(member.guild.id, config.defaultSettings);
    if (gsettings.log === null || !gsettings.logs.leave) return;
    let channel;
    try {
        channel = await member.guild.channels.fetch(gsettings.log);
    } catch (e) {
        return;
    }
    if (!channel.permissionsFor(client.user).has(["SEND_MESSAGES", "EMBED_LINKS", "VIEW_CHANNEL"]))
        return;
    const embed = new MessageEmbed()
        .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
        .setDescription(
            `**Left**\n**ID:** \`${member.id}\`\n**Joined Server:** <t:${Math.round(
                member.joinedTimestamp / 1000
            )}> (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)`
        )
        .setColor("c634eb");
    channel.send({ embeds: [embed] });
};
