import { MessageEmbed } from "discord.js";
import { settings } from "../db.js";
import config from "../config.js";

export default async (client, messages) => {
    const gsettings = await settings.ensure(messages.first().guild.id, config.defaultSettings);
    if (gsettings.log === null || !gsettings.logs.delete) return;
    let channel;
    try {
        channel = await messages.first().guild.channels.fetch(gsettings.log);
    } catch (e) {
        return;
    }
    if (!channel.permissionsFor(client.user).has(["SEND_MESSAGES", "EMBED_LINKS", "VIEW_CHANNEL"]))
        return;
    const embed = new MessageEmbed()
        .setTitle("Bulk Message Delete")
        .setDescription(
            `${messages.size} messages were deleted in ${messages.first().channel} \`${
                messages.first().channel.id
            }\``
        )
        .setColor("f54242");
    let content = "";
    messages
        .sorted((a, b) => a.createdTimestamp - b.createdTimestamp)
        .forEach((m) => {
            const attachments = m.attachments
                ? `\n${m.attachments.map((a) => a.proxyURL).join("\n")}`
                : "";
            content += `${m.author.tag} at ${m.createdAt.toLocaleString("en-GB", {
                timeZone: "UTC",
            })} UTC\n`;
            content += m.content;
            content += attachments;
            content += "\n\n";
        });
    const file = Buffer.from(content, "utf-8");
    channel.send({
        embeds: [embed],
        files: [
            {
                name: "messages.txt",
                attachment: file,
            },
        ],
    });
};
