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
        // Defer the command as it might take a while
        await command.deferReply();
        // Shortcut variable
        const server = command.guild;
        // Fetch bans
        let bans;
        try {
            bans = (await server.bans.fetch()).size.toString();
        } catch (e) {
            // Error means no perms -> no data
            bans = "Data not available.";
        }
        // Fetch channels
        const chs = await server.channels.fetch();
        // Create the embed
        const embed = new MessageEmbed()
            .setAuthor(server.name, server.iconURL())
            .setThumbnail(server.iconURL())
            .addField("Server ID", server.id, true)
            // Fetch the owner
            .addField("Owner", (await server.fetchOwner()).toString(), true)
            .addField("Members", server.memberCount.toString(), true)
            .addField(
                "Channels",
                `${
                    // Don't count threads or categories
                    server.channels.channelCountWithoutThreads -
                    chs.filter((c) => c.type === "GUILD_CATEGORY").size
                    // Count text and voice channels
                } [${chs.filter((c) => c.type === "GUILD_TEXT").size} text | ${
                    chs.filter((c) => c.type === "GUILD_VOICE").size
                } voice]`,
                true
            )
            // Fetch roles to get accurate count
            .addField("Roles", (await server.roles.fetch()).size.toString(), true)
            .addField("Ban count", bans, true)
            .addField(
                "Boost Tier",
                // Get and format boost tier
                server.premiumTier
                    .toString()
                    .replace("_", " ")
                    .toLowerCase()
                    // Title case
                    .replace(/\b(.)/g, (c) => c.toUpperCase()),
                true
            )
            .addField(
                "Created",
                // Use Discord markdown for timestamps
                `<t:${Math.round(server.createdTimestamp / 1000)}> (<t:${Math.round(
                    server.createdTimestamp / 1000
                )}:R>)`,
                true
            )
            .setColor("AQUA");
        // Send the embed
        await command.editReply({
            embeds: [embed],
        });
    },
};
