import { Message } from "discord.js";

export default {
    // Object of command data
    data: {
        // Data used to create the slash command
        slash: {
            name: "ping",
            description: "Test how well the bot is doing",
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
        // Defer so we can get replies easily
        await command.deferReply();
        // Reply
        const reply = await command.editReply("Ping?");
        if (!(reply instanceof Message)) return;
        // Calculate ping and edit the message
        await command.editReply(
            `Pong!\nPing: ${reply.createdTimestamp - command.createdTimestamp}ms\nAPI: ${
                client.ws.ping
            }ms`
        );
    },
};
