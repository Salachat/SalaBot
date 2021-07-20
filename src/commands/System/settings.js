import { MessageEmbed } from "discord.js";
import { settings } from "../../db.js";
import config from "../../config.js";

export default {
    // Object of command data
    data: {
        // Data used to create the slash command
        slash: {
            name: "settings",
            description: "Change the bot settings",
            options: [
                {
                    name: "list",
                    description: "List all settings",
                    type: "SUB_COMMAND",
                },
                {
                    name: "set",
                    description: "Change a setting value",
                    type: "SUB_COMMAND_GROUP",
                    options: [
                        {
                            name: "log",
                            description: "Set the logging channel",
                            type: "SUB_COMMAND",
                            options: [
                                {
                                    name: "channel",
                                    description: "The channel to send logs to",
                                    type: "CHANNEL",
                                    required: true,
                                },
                            ],
                        },
                        {
                            name: "joinlogs",
                            description: "Choose if to log member joins",
                            type: "SUB_COMMAND",
                            options: [
                                {
                                    name: "choice",
                                    description: "Your choice",
                                    type: "BOOLEAN",
                                    required: true,
                                },
                            ],
                        },
                        {
                            name: "leavelogs",
                            description: "Choose if to log member leaves",
                            type: "SUB_COMMAND",
                            options: [
                                {
                                    name: "choice",
                                    description: "Your choice",
                                    type: "BOOLEAN",
                                    required: true,
                                },
                            ],
                        },
                        {
                            name: "deletelogs",
                            description: "Choose if to log message deletes",
                            type: "SUB_COMMAND",
                            options: [
                                {
                                    name: "choice",
                                    description: "Your choice",
                                    type: "BOOLEAN",
                                    required: true,
                                },
                            ],
                        },
                        {
                            name: "editlogs",
                            description: "Choose if to log message edits",
                            type: "SUB_COMMAND",
                            options: [
                                {
                                    name: "choice",
                                    description: "Your choice",
                                    type: "BOOLEAN",
                                    required: true,
                                },
                            ],
                        },
                    ],
                },
                {
                    name: "reset",
                    description: "Reset a setting value",
                    type: "SUB_COMMAND",
                    options: [
                        {
                            name: "setting",
                            description: "setting to reset",
                            type: "STRING",
                            required: true,
                            choices: [
                                {
                                    name: "Log Channel",
                                    value: "log",
                                },
                                {
                                    name: "Log Joins",
                                    value: "logs.join",
                                },
                                {
                                    name: "Log Leaves",
                                    value: "logs.leave",
                                },
                                {
                                    name: "Log Deletes",
                                    value: "logs.delete",
                                },
                                {
                                    name: "Log Edits",
                                    value: "logs.edit",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        // User permission level to use the command
        permission: 1,
        guildOnly: true,
    },
    execute: async (_, command) => {
        // Defer the command as it might take a while
        await command.defer({ ephemeral: true });
        // Ensure that the guild settings exists
        await settings.ensure(command.guild.id, config.defaultSettings);
        // Take the SubCommandGroup or the SubCommand
        // eslint-disable-next-line no-underscore-dangle
        switch (command.options._group || command.options._subCommand) {
            case "list": {
                // Get all settings
                const {
                    log,
                    logs: { join, leave, delete: _delete, edit },
                } = await settings.get(command.guild.id);
                // Format the settings
                let formattedSettings = "";
                formattedSettings += `Log channel: ${log ? `<#${log}> \`${log}\`` : "`None`"}\n`;
                formattedSettings += `Log joins: \`${join ? "Yes" : "No"}\`\n`;
                formattedSettings += `Log leaves: \`${leave ? "Yes" : "No"}\`\n`;
                formattedSettings += `Log deletes: \`${_delete ? "Yes" : "No"}\`\n`;
                formattedSettings += `Log edits: \`${edit ? "Yes" : "No"}\``;
                // Create embed
                const embed = new MessageEmbed()
                    .setTitle("Settings")
                    .setDescription(formattedSettings)
                    .setColor("#ff69b4");
                // Send embed
                await command.editReply({
                    embeds: [embed],
                });
                break;
            }
            case "set": {
                // As set is a subcommand group
                // We can get the subcommand as setting to change
                switch (command.options.getSubCommand()) {
                    case "log": {
                        // Get the channel option
                        const channel = command.options.getChannel("channel");

                        // Check that it is a text channel
                        if (channel.type !== "GUILD_TEXT") {
                            await command.editReply({
                                content: "The logging channel must be a text channel.",
                            });
                            return;
                        }

                        // Save it and reply
                        await settings.set(`${command.guild.id}.log`, channel.id);
                        await command.editReply({
                            content: `Set the logging channel to ${channel}\nMake sure I have permissions to send messages there.`,
                        });
                        break;
                    }
                    case "joinlogs": {
                        // Get the boolean
                        const logs = command.options.getBoolean("choice");
                        // Save and reply
                        await settings.set(`${command.guild.id}.logs.join`, logs);
                        await command.editReply({
                            content: `Join logging is now \`${logs ? "enabled" : "disabled"}\`!`,
                        });
                        break;
                    }
                    case "leavelogs": {
                        // Get the boolean
                        const logs = command.options.getBoolean("choice");
                        // Save and reply
                        await settings.set(`${command.guild.id}.logs.leave`, logs);
                        await command.editReply({
                            content: `Leave logging is now \`${logs ? "enabled" : "disabled"}\`!`,
                        });
                        break;
                    }
                    case "deletelogs": {
                        // Get the boolean
                        const logs = command.options.getBoolean("choice");
                        // Save and reply
                        await settings.set(`${command.guild.id}.logs.delete`, logs);
                        await command.editReply({
                            content: `Deleted message logging is now \`${
                                logs ? "enabled" : "disabled"
                            }\`!`,
                        });
                        break;
                    }
                    case "editlogs": {
                        // Get the boolean
                        const logs = command.options.getBoolean("choice");
                        // Save and reply
                        await settings.set(`${command.guild.id}.logs.edit`, logs);
                        await command.editReply({
                            content: `Edited message logging is now \`${
                                logs ? "enabled" : "disabled"
                            }\`!`,
                        });
                        break;
                    }
                    default: {
                        // This shouldn't ever trigger but handle it anyway
                        await command.editReply({
                            content: "Unknown property.",
                        });
                    }
                }
                break;
            }
            case "reset": {
                // Get the setting option
                const property = command.options.getString("setting");
                // Split the path
                const path = property.split(".");
                // Get default settings
                let def = config.defaultSettings;
                // Traverse the path to get the default value
                for (let i = 0; i < path.length; i += 1) def = def[path[i]];
                // Save it to database, format it and reply
                await settings.set(`${command.guild.id}.${property}`, def);
                let formatted;
                if (def === null) formatted = "None";
                else formatted = def ? "Yes" : "No";
                await command.editReply({
                    content: `Setting reseted to the default value of \`${formatted}\`!`,
                });
                break;
            }
            default: {
                // This shouldn't ever trigger but handle it anyway
                await command.editReply({
                    content: "Unknown subcommand.",
                });
            }
        }
    },
};
