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
    execute: async (_, command) => {
        const { user, member: _member } = command.options.get("user");
        const member = _member ? await command.guild.members.fetch(_member.user.id) : null;

        const embed = new MessageEmbed()
            .setAuthor(
                `${user.tag}${user.bot ? " [BOT]" : ""}`,
                user.displayAvatarURL({ dynamic: true })
            )
            .setDescription(`Ping: ${user.toString()}\nID: \`${user.id}\``)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }));
        if (user.flags && user.flags.toArray().length) {
            embed.addField(
                "Badges",
                user.flags
                    .toArray()
                    .map((v) => v.toLowerCase().replace(/_/g, " "))
                    .join(", ")
                    .replace(/\b(.)/g, (c) => c.toUpperCase())
            );
        }
        embed.addField(
            "Joined discord",
            `<t:${Math.round(user.createdTimestamp / 1000)}> (<t:${Math.round(
                user.createdTimestamp / 1000
            )}:R>)`
        );

        if (member) {
            const boosting = member.premiumSince
                ? `Since <t:${Math.round(member.premiumSince / 1000)}>`
                : "Not boosting :(";
            embed
                .addField(
                    "Joined server",
                    `<t:${Math.round(member.joinedTimestamp / 1000)}> (<t:${Math.round(
                        member.joinedTimestamp / 1000
                    )}:R>)`
                )
                .addField("Boosting", boosting)
                .addField(
                    "Roles",
                    member.roles.cache
                        .map((r) => (r.id === command.guild.id ? null : `<@&${r.id}>`))
                        .filter(Boolean)
                        .splice(0, 44)
                        .join(" ")
                )
                .setColor(member.displayHexColor);
        }

        command.reply({
            embeds: [embed],
        });
    },
};
