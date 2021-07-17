import { MessageEmbed } from "discord.js";

export default {
    // Object of command data
    data: {
        // Data used to create the slash command
        slash: {
            name: "server",
            description: "Information about the server",
        },
        // User permission level to use the command
        permission: 0,
        guildOnly: true,
    },
    execute: async (_, command) => {
        const server = command.guild;
        let bans;
        try {
            bans = (await server.bans.fetch()).size.toString();
        } catch (e) {
            bans = "Data not available.";
        }
        const chs = await server.channels.fetch();
        const embed = new MessageEmbed()
            .setAuthor(server.name, server.iconURL())
            .setThumbnail(server.iconURL())
            .addField("Server ID", server.id, true)
            .addField("Owner", (await server.fetchOwner()).toString(), true)
            .addField("Members", server.memberCount.toString(), true)
            .addField(
                "Channels",
                `${
                    server.channels.channelCountWithoutThreads -
                    chs.filter((c) => c.type === "GUILD_CATEGORY").size
                } [${chs.filter((c) => c.type === "GUILD_TEXT").size} text | ${
                    chs.filter((c) => c.type === "GUILD_VOICE").size
                } voice]`,
                true
            )
            .addField("Roles", (await server.roles.fetch()).size.toString(), true)
            .addField("Ban count", bans, true)
            .addField(
                "Boost Tier",
                server.premiumTier
                    .toString()
                    .replace("_", " ")
                    .toLowerCase()
                    .replace(/\b(.)/g, (c) => c.toUpperCase()),
                true
            )
            .addField(
                "Created",
                `<t:${Math.round(server.createdTimestamp / 1000)}> (<t:${Math.round(
                    server.createdTimestamp / 1000
                )}:R>)`,
                true
            )
            .setColor("AQUA");

        command.reply({
            embeds: [embed],
        });
    },
};
