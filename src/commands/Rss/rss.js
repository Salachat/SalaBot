import { MessageEmbed, Util } from "discord.js";
import parser from "fast-xml-parser";

import { rss } from "../../db.js";
import { fetchFeed, formatPost, parseFeed } from "../../rss/rssUtil.js";
import { paginatedEmbed } from "../../util.js";

export default {
    // Object of command data
    data: {
        // Data used to create the slash command
        slash: {
            name: "rss",
            description: "Control your RSS subscriptions",
            options: [
                {
                    type: "SUB_COMMAND",
                    name: "add",
                    description: "Add a new feed to follow",
                    options: [
                        {
                            type: "CHANNEL",
                            name: "channel",
                            description: "Channel to send notifications to",
                            required: true,
                        },
                        {
                            type: "STRING",
                            name: "feed",
                            description: "RSS feed url",
                            required: true,
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "list",
                    description: "List your current feeds",
                },
                {
                    type: "SUB_COMMAND",
                    name: "remove",
                    description: "Remove a feed from the follow list",
                    options: [
                        {
                            type: "INTEGER",
                            name: "id",
                            description: "Feed to remove",
                            required: true,
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "test",
                    description: "Send an example post from feed.",
                    options: [
                        {
                            type: "INTEGER",
                            name: "id",
                            description: "Feed to test",
                            required: true,
                        },
                        {
                            type: "BOOLEAN",
                            name: "placeholders",
                            description: "If to send the placeholders instead of test message",
                            required: false,
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "edit",
                    description: "Edit a feed's formatting.",
                    options: [
                        {
                            type: "INTEGER",
                            name: "id",
                            description: "Feed to edit",
                            required: true,
                        },
                        {
                            type: "STRING",
                            name: "property",
                            description: "Property to edit",
                            required: true,
                            choices: [
                                {
                                    name: "Text Content",
                                    value: "text",
                                },
                                {
                                    name: "Embed Title",
                                    value: "embed.title",
                                },
                                {
                                    name: "Embed Description",
                                    value: "embed.description",
                                },
                                {
                                    name: "Embed URL",
                                    value: "embed.url",
                                },
                                {
                                    name: "Embed Color",
                                    value: "embed.color",
                                },
                                {
                                    name: "Embed Footer Text",
                                    value: "embed.footer-text",
                                },
                                {
                                    name: "Embed Footer Icon",
                                    value: "embed.footer-icon_url",
                                },
                                {
                                    name: "Embed Image",
                                    value: "embed.image-url",
                                },
                                {
                                    name: "Embed Thumbnail",
                                    value: "embed.thumbnail-url",
                                },
                                {
                                    name: "Embed Author Name",
                                    value: "embed.author-name",
                                },
                                {
                                    name: "Embed Author URL",
                                    value: "embed.author-url",
                                },
                                {
                                    name: "Embed Author Icon",
                                    value: "embed.author-icon_url",
                                },
                            ],
                        },
                        {
                            type: "STRING",
                            name: "value",
                            description: "Value for the edited property",
                            required: true,
                        },
                    ],
                },
            ],
        },
        // User permission level to use the command
        permission: 1,
        guildOnly: true,
    },
    execute: async (client, command) => {
        const subcommand = command.options.first();
        switch (subcommand.name) {
            case "add": {
                const { channel } = subcommand.options.get("channel");
                const feed = subcommand.options.get("feed").value.toString();

                const guildData = await rss.ensure(command.guildId, {
                    gid: command.guildId,
                    feeds: {},
                    autoNum: 1,
                });

                if (channel.type !== "GUILD_TEXT") {
                    await command.reply({
                        content: "The channel must be a text channel.",
                    });
                    return;
                }

                if (
                    !channel
                        .permissionsFor(client.user)
                        .has(["SEND_MESSAGES", "EMBED_LINKS", "VIEW_CHANNEL"])
                ) {
                    await command.reply({
                        content:
                            "I am missing some permissions on that channel.\nMake sure I can view the channel, send messages and send embeds.",
                    });
                    return;
                }

                let feedData;
                let parsedData;
                try {
                    feedData = await fetchFeed(feed, true);
                    parsedData = parser.parse(feedData);
                } catch (e) {
                    await command.reply({
                        content: `Encountered an error in the RSS feed: \`${e.message}\``,
                    });
                    return;
                }

                const feedTitle = parsedData?.rss?.channel?.title;
                const items = parsedData?.rss?.channel?.item;

                if (!feedTitle) {
                    await command.reply({
                        content: "Invalid rss feed. Couldn't find channel title.",
                    });
                    return;
                }

                if (!items) {
                    await command.reply({
                        content: "Invalid rss feed. Couldn't find any items.",
                    });
                    return;
                }

                await rss.set(`${command.guildId}.feeds.${guildData.autoNum}`, {
                    fid: guildData.autoNum,
                    cid: channel.id,
                    title: feedTitle,
                    url: feed,
                    oldData: parseFeed(feedData),
                    format: {
                        text: "**{title}**\n{description}\n\n<{link}>",
                        embed: {
                            "title": "{empty}",
                            "description": "{empty}",
                            "url": "{empty}",
                            "color": "{empty}",
                            "footer-text": "{empty}",
                            "footer-icon_url": "{empty}",
                            "image-url": "{empty}",
                            "thumbnail-url": "{empty}",
                            "author-name": "{empty}",
                            "author-url": "{empty}",
                            "author-icon_url": "{empty}",
                        },
                    },
                });
                await rss.inc(`${command.guildId}.autoNum`);
                await command.reply({
                    content: `${channel} is now following **${Util.escapeMarkdown(
                        feedTitle
                    )}** (<${feed}>).\nMake sure I will have permissions to that channel.\nEdit the posts by using \`/rss edit\``,
                });
                break;
            }
            case "list": {
                const guildData = await rss.ensure(command.guildId, {
                    gid: command.guildId,
                    feeds: {},
                    autoNum: 1,
                });
                const feeds = Object.values(guildData.feeds);
                if (feeds.length === 0) {
                    await command.reply({
                        content: "No feeds subscribed.",
                    });
                    return;
                }
                const pages = [];
                for (let i = 0; i < feeds.length; i += 10) pages.push(feeds.slice(i, i + 10));
                await paginatedEmbed(
                    client,
                    command,
                    pages.map((feedChunk, i) => {
                        const embed = new MessageEmbed()
                            .setTitle(`Feeds (${feeds.length})`)
                            .setColor("#9799ca")
                            .setFooter(`Page ${i + 1}/${pages.length}`);
                        feedChunk.forEach((feed) => {
                            embed.addField(
                                `${feed.fid}. ${feed.title}`,
                                `Channel: <#${feed.cid}>\nLink: <${feed.url}>`
                            );
                        });
                        return embed;
                    })
                );
                break;
            }
            case "remove": {
                const feed = subcommand.options.get("id").value.toString();
                const guildData = await rss.ensure(command.guildId, {
                    gid: command.guildId,
                    feeds: {},
                    autoNum: 1,
                });
                if (!Object.keys(guildData.feeds).includes(feed)) {
                    await command.reply({
                        content: "Invalid feed id. Use `/rss list` to find your feed id.",
                    });
                    return;
                }
                await rss.delete(`${command.guildId}.feeds.${feed}`);
                await command.reply({
                    content: `Feed **${Util.escapeMarkdown(guildData.feeds[feed].title)}** (<${
                        guildData.feeds[feed].url
                    }>) has been removed!`,
                });
                break;
            }
            case "test": {
                const id = subcommand.options.get("id").value.toString();
                const placeholders = subcommand.options.get("placeholders")?.value ?? false;
                const guildData = await rss.ensure(command.guildId, {
                    gid: command.guildId,
                    feeds: {},
                    autoNum: 1,
                });

                if (!Object.keys(guildData.feeds).includes(id)) {
                    await command.reply({
                        content: "Invalid feed id. Use `/rss list` to find your feed id.",
                    });
                    return;
                }
                const feed = guildData.feeds[id];

                let feedData;
                try {
                    feedData = await fetchFeed(feed.url);
                } catch (e) {
                    await command.reply({
                        content: `Encountered an error in the RSS feed: \`${e.message}\``,
                    });
                    return;
                }

                const randomPost = feedData[Math.floor(Math.random() * feedData.length)];

                if (placeholders) {
                    await command.reply({
                        content: `\`\`\`md\n${Object.entries(randomPost)
                            .map(([key, val]) => `# {${key}}\n${val}`)
                            .join(
                                "\n"
                            )}\n\`\`\`\nTo leave a field empty, use the inbuilt \`{empty}\` placeholder.\nTo get a newline, use the inbuilt \`{newline}\` placeholder.`,
                    });
                } else {
                    try {
                        await command.reply(formatPost(randomPost, feed.format));
                    } catch (e) {
                        await command.reply({
                            content: `Encountered an error in the RSS feed: \`${e.message}\``,
                        });
                    }
                }
                break;
            }
            case "edit": {
                const feed = subcommand.options.get("id").value.toString();
                const { value: property } = subcommand.options.get("property");
                const { value } = subcommand.options.get("value");

                const guildData = await rss.ensure(command.guildId, {
                    gid: command.guildId,
                    feeds: {},
                    autoNum: 1,
                });

                if (!Object.keys(guildData.feeds).includes(feed)) {
                    await command.reply({
                        content: "Invalid feed id. Use `/rss list` to find your feed id.",
                    });
                    return;
                }

                await rss.set(`${command.guildId}.feeds.${feed}.format.${property}`, value);

                await command.reply({
                    content: "Format updated. Use `/rss test` to test it out.",
                });
                break;
            }
            default: {
                await command.reply({
                    content: "Unknown subcommand.",
                });
            }
        }
    },
};
