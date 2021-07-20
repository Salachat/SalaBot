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
    execute: async (client, command) => {
        // Defer so we can get replies easily
        await command.defer();
        // Reply
        const reply = await command.editReply("Ping?");
        // Calculate ping and edit the message
        await command.editReply(
            `Pong!\nPing: ${reply.createdTimestamp - command.createdTimestamp}ms\nAPI: ${
                client.ws.ping
            }ms`
        );
    },
};
