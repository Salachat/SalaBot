import { MessageEmbed } from "discord.js";

export default {
    // Object of command data
    data: {
        // Data used to create the slash command
        slash: {
            name: "links",
            description: "Get important links about the bot",
        },
        // User permission level to use the command
        permission: 0,
        guildOnly: false,
    },
    execute: (client, command) => {
        const embed = new MessageEmbed().setTitle("Links").setDescription(
            `[Invite](${client.generateInvite({
                scopes: ["bot", "applications.commands"],
                permissions: ["ADMINISTRATOR"],
            })})\n[GitHub](https://github.com/Salachat/SalaBot)`
        );
        command.reply({
            embeds: [embed],
        });
    },
};
