import { MessageEmbed } from "discord.js";

export default {
    // Object of command data
    data: {
        // Data used to create the slash command
        slash: {
            name: "user",
            description: "Information about some user",
            options: [
                {
                    type: "USER",
                    name: "user",
                    description: "User you want to know about",
                    required: true,
                },
            ],
        },
        // User permission level to use the command
        permission: 0,
        guildOnly: true,
    },
    /**
     * @param {import("discord.js").CommandInteraction} command
     */
    execute: async (_, command) => {
        // Defer the command as it might take a while
        await command.deferReply();
        // Get the user option
        const user = command.options.getUser("user");
        // Try to fetch the member
        let member;
        try {
            member = await command.guild.members.fetch(user);
        } catch (e) {
            member = null;
        }

        // Create the embed
        const embed = new MessageEmbed()
            .setAuthor({
                name: `${user.tag}${user.bot ? " [BOT]" : ""}`,
                iconURL: user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`Ping: ${user.toString()}\nID: \`${user.id}\``)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }));
        // Check if users has flags aka badges
        if (user.flags && user.flags.toArray().length) {
            embed.addField(
                "Badges",
                // Format badges
                user.flags
                    .toArray()
                    // Spaces
                    .map((v) => v.toLowerCase().replace(/_/g, " "))
                    .join(", ")
                    // Title case
                    .replace(/\b(.)/g, (c) => c.toUpperCase())
            );
        }
        embed.addField(
            "Joined discord",
            // Use Discord markdown for timestamps
            `<t:${Math.round(user.createdTimestamp / 1000)}> (<t:${Math.round(
                user.createdTimestamp / 1000
            )}:R>)`
        );

        // Add additional member fields if member was found
        if (member) {
            // Boosting status with markdown timestamp or a funny message
            const boosting = member.premiumSince
                ? `Since <t:${Math.round(member.premiumSinceTimestamp / 1000)}>`
                : "Not boosting :(";
            embed
                .addField(
                    "Joined server",
                    // Use the fancy datetime markdown yet again
                    `<t:${Math.round(member.joinedTimestamp / 1000)}> (<t:${Math.round(
                        member.joinedTimestamp / 1000
                    )}:R>)`
                )
                .addField("Boosting", boosting)
                .addField(
                    "Roles",
                    member.roles.cache
                        // Filter out everyone and turn roles into mentions
                        .map((r) => (r.id === command.guild.id ? null : r.toString()))
                        .filter(Boolean)
                        // This is the max amount of roles we can fit in the embed
                        .splice(0, 44)
                        .join(" ")
                )
                // Color the embed using the members role
                .setColor(member.displayHexColor);
        }

        // Reply with the embed
        await command.editReply({
            embeds: [embed],
        });
    },
};
