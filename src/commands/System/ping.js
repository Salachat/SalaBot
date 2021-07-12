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
    },
    execute: async (client, command) => {
        // Simple reply with a "Pong!
        await command.reply("Pong!");
        // Calculate ping and edit the message
        const reply = await command.fetchReply();
        reply.edit(
            `Pong!\nPing: ${reply.createdTimestamp - command.createdTimestamp}ms\nAPI: ${
                client.ws.ping
            }ms`
        );
    },
};
