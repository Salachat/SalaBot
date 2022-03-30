import { MessageEmbed } from "discord.js";
import { sanulit } from "../../db.js";

export default {
    data: {
        slash: {
            name: "sanuli",
            description: "Sanuli",
            options: [
                {
                    type: "SUB_COMMAND",
                    name: "stats",
                    description: "Your sanuli statistics",
                    options: [
                        {
                            type: "USER",
                            name: "user",
                            description: "The user to get statistics for",
                            required: false,
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "leaderboard",
                    description: "The sanuli leaderboard",
                },
            ],
        },
        permission: 0,
        guildOnly: false,
    },
    /**
     * @param {import("discord.js").Client} client
     * @param {import("discord.js").CommandInteraction} command
     */
    execute: async (client, command) => {
        await command.deferReply();
        switch (command.options.getSubcommand()) {
            case "stats": {
                const user = command.options.getUser("user")?.id ?? command.user.id;
                await sanulit.ensure(user, {
                    user,
                    guesses: {},
                });
                const data = await sanulit.get(user);
                const guesses = Object.values(data.guesses);
                const stats = guesses.reduce((g, n) => {
                    const k = n.toString();
                    g[k] = g[k] ? g[k] + 1 : 1;
                    return g;
                }, {});
                const embed = new MessageEmbed()
                    .setTitle(`Sanulis of ${command.user.tag}`)
                    .setColor("#F4AFAB")
                    .setDescription(
                        "**Statistics**" +
                            `\n__Played__: ${guesses.length}` +
                            `\n__Win-%__: ${
                                guesses.length
                                    ? Math.round(
                                          (guesses.length / guesses.filter((n) => n > 0).length) *
                                              100
                                      )
                                    : 0
                            } %` +
                            `\n__Streak__: ${guesses.length - 1 - guesses.lastIndexOf(-1)}` +
                            `\n__Best streak__: ${guesses.reduce((best, _, index, arr) => {
                                let streak = arr.slice(index).indexOf(-1);
                                streak = streak === -1 ? arr.length - index : streak;
                                return streak > best ? streak : best;
                            }, 0)}` +
                            `\n__Average guesses__: ${
                                guesses.length
                                    ? Math.round(
                                          guesses
                                              .filter((n) => n !== -1)
                                              .reduce((a, n) => a + n, 0) / guesses.length
                                      )
                                    : 0
                            }` +
                            "\n" +
                            "\n**Distribution**" +
                            `\n**1:** ${stats["1"] ?? 0}` +
                            `\n**2:** ${stats["2"] ?? 0}` +
                            `\n**3:** ${stats["3"] ?? 0}` +
                            `\n**4:** ${stats["4"] ?? 0}` +
                            `\n**5:** ${stats["5"] ?? 0}` +
                            `\n**6:** ${stats["6"] ?? 0}`
                    );
                await command.editReply({ embeds: [embed] });
                break;
            }
            case "leaderboard": {
                const data = await sanulit.values;
                const top10 = data
                    .map((u) => ({
                        user: u.user,
                        total: Object.keys(u.guesses).length
                            ? Object.values(u.guesses)
                                  .filter((n) => n !== -1)
                                  .reduce((a, n) => a + n, 0) / Object.keys(u.guesses).length
                            : 0,
                    }))
                    .slice(0, 10)
                    .sort((a, b) => b.total - a.total);
                const embed = new MessageEmbed()
                    .setTitle("Sanuli Leaderboard")
                    .setColor("#F4AFAB")
                    .setDescription(
                        (
                            await Promise.all(
                                top10.map(
                                    async (u, i) =>
                                        `${i + 1}. **${
                                            (
                                                await client.users.fetch(u.user)
                                            ).tag
                                        }** - ${u.total.toFixed(2)} guesses`
                                )
                            )
                        ).join("\n")
                    );
                await command.editReply({ embeds: [embed] });
                break;
            }
            default: {
                await command.editReply("Unknown subcommand.");
            }
        }
    },
};
