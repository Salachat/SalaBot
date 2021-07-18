import { MessageEmbed, Util } from "discord.js";
import { settings } from "../db.js";
import config from "../config.js";

export default async (client, message) => {
    const gsettings = await settings.ensure(message.guild.id, config.defaultSettings);
    if (gsettings.log === null || !gsettings.logs.delete) return;
    let channel;
    try {
        channel = await message.guild.channels.fetch(gsettings.log);
    } catch (e) {
        return;
    }
    if (!channel.permissionsFor(client.user).has(["SEND_MESSAGES", "EMBED_LINKS", "VIEW_CHANNEL"]))
        return;
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
    if (message.attachments.size > 0) {
        embed.addField(
            "Cached attachments",
            message.attachments.map((v) => `[${v.name}](${v.proxyURL})`).join(" ")
        );
    }
    channel.send({ embeds: [embed] });
};
