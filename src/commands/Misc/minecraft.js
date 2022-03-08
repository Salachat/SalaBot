import { MessageEmbed } from "discord.js";
import { PingMC } from "pingmc";

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
    /**
     * @param {import("discord.js").Client} client
     * @param {import("discord.js").CommandInteraction} command
     */
    execute: async (client, command) => {
        // Defer the command as it might take a while
        await command.deferReply();
        const server = new PingMC(
            `${command.options.getString("ip")}${
                command.options.getInteger("port") ? `:${command.options.getInteger("port")}` : ""
            }`
        );
        await server
            .ping()
            .then(async (data) => {
                let playerlist;
                if (data.players.online < 1) {
                    playerlist = "No one is online :c";
                } else {
                    playerlist = data.players.sample.map((v) => v.name).join(", ");
                }
                const statusEmbed = new MessageEmbed()
                    .setThumbnail("attachment://thumbnail.png")
                    .setTitle(`Status of ${command.options.getString("ip")}`)
                    .setColor("#444444")
                    .addFields(
                        { name: "MOTD:", value: data.motd.clear },
                        { name: "Server software:", value: data.version.name },
                        {
                            name: "Players online:",
                            value: `${data.players.online} out of ${data.players.max}`,
                        }
                    );
                const playerEmbed = new MessageEmbed()
                    .setThumbnail("attachment://thumbnail.png")
                    .setTitle(`Playerlist of ${command.options.getString("ip")}`)
                    .setColor("#444444")
                    .addField(
                        `${data.players.online} / ${data.players.max} players online`,
                        playerlist
                    );
                await command.editReply({
                    embeds: [statusEmbed, playerEmbed],
                    files: [
                        {
                            attachment: data.favicon.data,
                            name: "thumbnail.png",
                        },
                    ],
                });
            })
            .catch(async () => {
                await command.editReply("An error occured fetching the status.");
            });
    },
};
