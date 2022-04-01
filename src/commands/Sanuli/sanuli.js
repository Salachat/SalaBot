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
                const playedGames = Object.keys(data.guesses).length;
                const guesses = playedGames
                    ? Array(
                          Object.keys(data.guesses)
                              .map(Number)
                              .sort((a, b) => b - a)[0] + 1
                      )
                          .fill(0)
                          .map((v, i) => data.guesses[i] ?? v)
                    : [];
                const stats = guesses.reduce((g, n) => {
                    const k = n.toString();
                    g[k] = g[k] ? g[k] + 1 : 1;
                    return g;
                }, {});
                const totalStat = Array(6)
                    .fill()
                    .map((_, i) => stats[i + 1] ?? 0)
                    .reduce((a, b) => a + b);
                const wonGames = guesses.filter((n) => n > 0);
                const embed = new MessageEmbed()
                    .setTitle(
                        `Sanulis of ${command.options.getUser("user")?.tag ?? command.user.tag}`
                    )
                    .setColor("#F4AFAB")
                    .setDescription(
                        "**Statistics**" +
                            `\n__Played__: ${playedGames}` +
                            `\n__Win-%__: ${
                                playedGames ? Math.round((wonGames.length / playedGames) * 100) : 0
                            } %` +
                            `\n__Streak__: ${
                                guesses.length -
                                1 -
                                Math.max(guesses.lastIndexOf(-1), guesses.lastIndexOf(0))
                            }` +
                            `\n__Best streak__: ${
                                guesses.reduce(
                                    ([b, c], v) => [
                                        Math.max(b, v > 0 ? c + 1 : 0),
                                        v > 0 ? c + 1 : 0,
                                    ],
                                    [0, 0]
                                )[0]
                            }` +
                            `\n__Average guesses__: ${
                                playedGames
                                    ? (
                                          wonGames.reduce((a, n) => a + n, 0) / wonGames.length
                                      ).toFixed(2)
                                    : 0
                            }` +
                            "\n" +
                            "\n**Distribution**" +
                            `\n\`1: ${stats["1"] ?? 0}\` ${"🟩".repeat(
                                Math.floor((stats["1"] / totalStat) * 11)
                            )}` +
                            `\n\`2: ${stats["2"] ?? 0}\` ${"🟩".repeat(
                                Math.floor((stats["2"] / totalStat) * 11)
                            )}` +
                            `\n\`3: ${stats["3"] ?? 0}\` ${"🟩".repeat(
                                Math.floor((stats["3"] / totalStat) * 11)
                            )}` +
                            `\n\`4: ${stats["4"] ?? 0}\` ${"🟩".repeat(
                                Math.floor((stats["4"] / totalStat) * 11)
                            )}` +
                            `\n\`5: ${stats["5"] ?? 0}\` ${"🟩".repeat(
                                Math.floor((stats["5"] / totalStat) * 11)
                            )}` +
                            `\n\`6: ${stats["6"] ?? 0}\` ${"🟩".repeat(
                                Math.floor((stats["6"] / totalStat) * 11)
                            )}`
                    );
                await command.editReply({ embeds: [embed] });
                break;
            }
            case "leaderboard": {
                const data = await sanulit.values;
                const top10 = data
                    .map((u) => {
                        const guesses = Object.values(u.guesses).filter((n) => n !== -1);
                        return {
                            user: u.user,
                            total: guesses.length
                                ? guesses.reduce((a, n) => a + n, 0) / guesses.length
                                : -1,
                        };
                    })
                    .filter(({ total }) => total !== -1)
                    .sort((a, b) => a.total - b.total)
                    .slice(0, 10);
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
