import { version, MessageEmbed } from "discord.js";
import { formatDuration } from "../../util.js";

export default {
    // Object of command data
    data: {
        // Data used to create the slash command
        slash: {
            name: "stats",
            description: "Get bot statistics",
        },
        // User permission level to use the command
        permission: 0,
        guildOnly: false,
    },
    execute: async (client, command) => {
        // Embed with all the data
        const embed = new MessageEmbed()
            .setTitle("Stats")
            // Get program versions from packages
            .addField("<:e:525156067743891486> Node.js Version", process.version, true)
            .addField("<:e:520718822152470530> Discord.js Version", version, true)
            // Format client uptime using short option
            .addField("⏱ Uptime", formatDuration(client.uptime, { short: true }), true)
            // Get and format heap usage as ram
            .addField(
                "💽 Ram",
                `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
                true
            )
            // Get ping from the websocket
            .addField("<:e:619820919984226305> Ping", `${client.ws.ping} ms`, true)
            // Get users, channels and guilds from cache
            .addField(
                "👥 Users (cached)",
                `${client.users.cache.size} user${client.users.cache.size > 1 ? "s" : ""}, in ${
                    client.channels.cache.size
                } channel${client.channels.cache.size > 1 ? "s" : ""} of ${
                    client.guilds.cache.size
                } server${client.guilds.cache.size > 1 ? "s" : ""}.`,
                true
            );
        // Send the embed
        await command.reply({
            embeds: [embed],
        });
    },
};
