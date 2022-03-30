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
    /**
     * @param {import("discord.js").Client} client
     * @param {import("discord.js").CommandInteraction} command
     */
    execute: async (client, command) => {
        // Create the embed
        const embed = new MessageEmbed().setTitle("Links").setDescription(
            // Generate the invite link on the fly
            `[Invite](${client.generateInvite({
                scopes: ["bot", "applications.commands"],
                permissions: ["ADMINISTRATOR"],
            })})\n[GitHub](https://github.com/Salachat/SalaBot)`
        );
        // Reply with the embed
        await command.reply({
            embeds: [embed],
        });
    },
};
