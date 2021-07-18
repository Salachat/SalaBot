import { perm } from "../util.js";

export default async (client, command) => {
    try {
        // Get the command handler
        const cmd = client.commands.get(command.commandName);
        // Check if handler exists
        if (cmd) {
            if (cmd.data.guildOnly && !command.inGuild()) {
                await command.reply({
                    content: "This command can only be used inside a server.",
                    ephemeral: true,
                });
                return;
            }
            // Check user permissions
            // (Slash command permissions are too hard)
            const permission = perm(command);
            if (permission >= cmd.data.permission) {
                // Execute the handler with the command interaction
                await cmd.execute(client, command);
            } else {
                // Send "no permission" -error
                await command.reply({
                    content: "Sorry but you do not have enough permissions to use that command.",
                    ephemeral: true,
                });
            }
        } else {
            // If no handler, send "not implemented" -error
            await command.reply({
                content: "Sorry but that command isn't implemented.",
                ephemeral: true,
            });
        }
    } catch (e) {
        // If command errors, try to tell the user
        try {
            await command.followUp({
                content: "Something went wrong while executing that command...",
                ephemeral: true,
            });
        } catch (_) {
            /* ignore */
        } finally {
            // And log to console
            console.error(e);
        }
    }
};
