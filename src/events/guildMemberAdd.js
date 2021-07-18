import { MessageEmbed } from "discord.js";
import { settings } from "../db.js";
import config from "../config.js";

export default async (client, member) => {
    const gsettings = await settings.ensure(member.guild.id, config.defaultSettings);
    if (gsettings.log === null || !gsettings.logs.join) return;
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
            `**Joined**\n**ID:** \`${member.id}\`\n**Joined Discord:** <t:${Math.round(
                member.user.createdTimestamp / 1000
            )}> (<t:${Math.round(member.user.createdTimestamp / 1000)}:R>)`
        )
        .setColor("34a2eb");
    channel.send({ embeds: [embed] });
};
