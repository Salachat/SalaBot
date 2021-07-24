import { MessageEmbed } from "discord.js";
import minecraft from "minecraft-protocol";
import { paginatedEmbed } from "../../util.js";

// We do be doing magic fuckery as minecraft-protocol is commonjs module
const { ping } = minecraft;

export default {
    // Object of command data
    data: {
        // Data used to create the slash command
        slash: {
            name: "minecraft",
            description: "Did your favorite server get DDoS'ed or is your internet just bad?",
            options: [
                {
                    type: "STRING",
                    name: "ip",
                    description: "Server's IP or domain",
                    required: true,
                },
                {
                    type: "INTEGER",
                    name: "port",
                    description: "Server's port",
                    required: false,
                },
            ],
        },
        // User permission level to use the command
        permission: 0,
        guildOnly: false,
    },
    execute: async (client, command) => {
        // Defer the command as it might take a while
        await command.defer();
        ping(
            {
                host: command.options.getString("ip"),
                port: command.options.getInteger("port") ?? 25565,
            },
            async (err, data) => {
                if (err) {
                    await command.editReply({
                        content: "An error occured fetching the status.",
                    });
                    return;
                }
                const motd = data.description.text.replaceAll(/§./g, "");
                let playerlist;
                if (data.players.online < 1) {
                    playerlist = "No one is online :c";
                } else {
                    playerlist = data.players.sample.map((v) => v.name).join(", ");
                }
                const embeds = [
                    new MessageEmbed()
                        .setThumbnail(
                            `https://eu.mc-api.net/v3/server/favicon/${command.options.getString(
                                "ip"
                            )}:${command.options.getInteger("port") ?? 25565}`
                        )
                        .setTitle(`Status of ${command.options.getString("ip")}`)
                        .setColor("#444444")
                        .addFields(
                            { name: "MOTD:", value: motd },
                            { name: "Server software:", value: data.version.name },
                            {
                                name: "Players online:",
                                value: `${data.players.online} out of ${data.players.max}`,
                            }
                        ),
                    new MessageEmbed()
                        .setThumbnail(
                            `https://eu.mc-api.net/v3/server/favicon/${command.options.getString(
                                "ip"
                            )}:${command.options.getInteger("port") ?? 25565}`
                        )
                        .setTitle(`Playerlist of ${command.options.getString("ip")}`)
                        .setColor("#444444")
                        .addField(
                            `${data.players.online} / ${data.players.max} players online`,
                            playerlist
                        ),
                ];
                await paginatedEmbed(client, command, embeds);
            }
        );
    },
};
