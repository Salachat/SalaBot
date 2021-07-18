import { MessageEmbed, Util } from "discord.js";
import { settings } from "../db.js";
import config from "../config.js";

export default async (client, oldMessage, newMessage) => {
    const gsettings = await settings.ensure(oldMessage.guild.id, config.defaultSettings);
    if (gsettings.log === null || !gsettings.logs.edit) return;
    let channel;
    try {
        channel = await oldMessage.guild.channels.fetch(gsettings.log);
    } catch (e) {
        return;
    }
    if (!channel.permissionsFor(client.user).has(["SEND_MESSAGES", "EMBED_LINKS", "VIEW_CHANNEL"]))
        return;
    if (oldMessage.content === newMessage.content) return;
    const embed = new MessageEmbed()
        .setAuthor(oldMessage.author.tag, oldMessage.author.displayAvatarURL({ dynamic: true }))
        .setDescription(
            `**Message Edited**\n**Channel:** ${oldMessage.channel} (\`${
                oldMessage.channel.id
            }\`)\n**Old**\n\`\`\`\n${
                Util.cleanCodeBlockContent(oldMessage.content) || "\u200b"
            }\n\`\`\`\n**New**\n\`\`\`\n${
                Util.cleanCodeBlockContent(newMessage.content) || "\u200b"
            }\n\`\`\``
        )
        .setColor("2a97f7");
    channel.send({ embeds: [embed] });
};
