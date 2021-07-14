export default {
    // Object of command data
    data: {
        // Data used to create the slash command
        slash: {
            name: "stop",
            description: "Kill the bot",
        },
        // User permission level to use the command
        permission: 2,
    },
    execute: async (_, command) => {
        await command.reply({
            content: "Shutting down...",
            ephemeral: true,
        });
        process.exit();
    },
};
