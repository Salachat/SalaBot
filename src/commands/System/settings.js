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
        const subcommand = command.options.first();
        switch (subcommand.name) {
            case "list": {
                const {
                    log,
                    logs: { join, leave, delete: _delete, edit },
                } = await settings.get(command.guild.id);
                let formattedSettings = "";
                formattedSettings += `Log channel: ${log ? `<#${log}> \`${log}\`` : "`None`"}\n`;
                formattedSettings += `Log joins: \`${join ? "Yes" : "No"}\`\n`;
                formattedSettings += `Log leaves: \`${leave ? "Yes" : "No"}\`\n`;
                formattedSettings += `Log deletes: \`${_delete ? "Yes" : "No"}\`\n`;
                formattedSettings += `Log edits: \`${edit ? "Yes" : "No"}\``;
                const embed = new MessageEmbed()
                    .setTitle("Settings")
                    .setDescription(formattedSettings)
                    .setColor("#ff69b4");
                command.reply({
                    embeds: [embed],
                    ephemeral: true,
                });
                break;
            }
            case "set": {
                const property = subcommand.options.first();
                const { value } = property.options.first();
                switch (property.name) {
                    case "log": {
                        const channel = await command.guild.channels.fetch(value);

                        if (channel.type !== "GUILD_TEXT") {
                            command.reply({
                                content: "The logging channel must be a text channel.",
                                ephemeral: true,
                            });
                            return;
                        }

                        await settings.set(`${command.guild.id}.log`, value);
                        command.reply({
                            content: `Set the logging channel to <#${value}>\nMake sure I have permissions to send messages there.`,
                            ephemeral: true,
                        });
                        break;
                    }
                    case "joinlogs": {
                        await settings.set(`${command.guild.id}.logs.join`, value);
                        command.reply({
                            content: `Join logging is now \`${value ? "enabled" : "disabled"}\`!`,
                            ephemeral: true,
                        });
                        break;
                    }
                    case "leavelogs": {
                        await settings.set(`${command.guild.id}.logs.leave`, value);
                        command.reply({
                            content: `Leave logging is now \`${value ? "enabled" : "disabled"}\`!`,
                            ephemeral: true,
                        });
                        break;
                    }
                    case "deletelogs": {
                        await settings.set(`${command.guild.id}.logs.delete`, value);
                        command.reply({
                            content: `Deleted message logging is now \`${
                                value ? "enabled" : "disabled"
                            }\`!`,
                            ephemeral: true,
                        });
                        break;
                    }
                    case "editlogs": {
                        await settings.set(`${command.guild.id}.logs.edit`, value);
                        command.reply({
                            content: `Edited message logging is now \`${
                                value ? "enabled" : "disabled"
                            }\`!`,
                            ephemeral: true,
                        });
                        break;
                    }

                    default: {
                        command.reply({
                            content: "Unknown property.",
                            ephemeral: true,
                        });
                    }
                }
                break;
            }
            case "reset": {
                const { value: property } = subcommand.options.first();
                const path = property.split(".");
                let def = config.defaultSettings;
                for (let i = 0; i < path.length; i += 1) def = def[path[i]];
                await settings.set(`${command.guild.id}.${property}`, def);
                let formatted;
                if (def === null) formatted = "None";
                else formatted = def ? "Yes" : "No";
                command.reply({
                    content: `Setting reseted to the default value of \`${formatted}\`!`,
                    ephemeral: true,
                });
                break;
            }
            default: {
                command.reply({
                    content: "Unknown subcommand.",
                    ephemeral: true,
                });
            }
        }
    },
};
