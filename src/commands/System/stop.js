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
        guildOnly: false,
    },
    execute: async (_, command) => {
        // Send a message
        await command.reply({
            content: "Shutting down...",
            ephemeral: true,
        });
        // Exit process and handler gracefully in the exit event
        process.exit();
    },
};
