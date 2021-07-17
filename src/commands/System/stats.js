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
    execute: (client, command) => {
        const embed = new MessageEmbed()
            .setTitle("Stats")
            .addField("<:e:525156067743891486> Node.js Version", process.version, true)
            .addField("<:e:520718822152470530> Discord.js Version", version, true)
            .addField("⏱ Uptime", formatDuration(client.uptime, { short: true }), true)
            .addField(
                "💽 Ram",
                `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
                true
            )
            .addField("<:e:619820919984226305> Ping", `${client.ws.ping} ms`, true)
            .addField(
                "👥 Users (cached)",
                `${client.users.cache.size} user${client.users.cache.size > 1 ? "s" : ""}, in ${
                    client.channels.cache.size
                } channel${client.channels.cache.size > 1 ? "s" : ""} of ${
                    client.guilds.cache.size
                } server${client.guilds.cache.size > 1 ? "s" : ""}.`,
                true
            );
        command.reply({
            embeds: [embed],
        });
    },
};
