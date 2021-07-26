import { MessageEmbed, Util } from "discord.js";
import parser from "fast-xml-parser";

import { rss } from "../../db.js";
import { fetchFeed, formatPost, parseFeed, getPlaceholders } from "../../rss/rssUtil.js";
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
        // Defer the command as it might take a while
        await command.defer();
        // Switch based on the subcommand
        switch (command.options.getSubCommand()) {
            case "add": {
                // Get channel and feed url from slash options
                const channel = command.options.getChannel("channel");
                const feed = command.options.getString("feed");

                // Ensure the RSS settings exist and get them
                const guildData = await rss.ensure(command.guildId, {
                    gid: command.guildId,
                    feeds: {},
                    autoNum: 1,
                });

                // Check that the channel is a text channel
                if (channel.type !== "GUILD_TEXT") {
                    await command.editReply({
                        content: "The channel must be a text channel.",
                    });
                    return;
                }

                // Check permissions
                if (
                    !channel
                        .permissionsFor(client.user)
                        .has(["SEND_MESSAGES", "EMBED_LINKS", "VIEW_CHANNEL"])
                ) {
                    // Reply with explanation
                    await command.editReply({
                        content:
                            "I am missing some permissions on that channel.\nMake sure I can view the channel, send messages and send embeds.",
                    });
                    return;
                }

                // Get the raw feed and parsed items
                let feedData;
                let parsedData;
                try {
                    feedData = await fetchFeed(feed, true);
                    parsedData = parser.parse(feedData);
                } catch (e) {
                    // Reply with error if such happens
                    await command.editReply({
                        content: `Encountered an error in the RSS feed: \`${e.message}\``,
                    });
                    return;
                }

                // Get feed title and items
                const feedTitle = parsedData?.rss?.channel?.title ?? parsedData?.feed?.title;
                const items = parsedData?.rss?.channel?.item ?? parsedData?.feed?.entry;

                // Check that title exists
                if (!feedTitle) {
                    await command.editReply({
                        content: "Invalid RSS feed. Couldn't find channel title.",
                    });
                    return;
                }

                // Check that some items exists
                if (!items) {
                    await command.editReply({
                        content: "Invalid RSS feed. Couldn't find any items.",
                    });
                    return;
                }

                // Save the RSS feed
                await rss.set(`${command.guildId}.feeds.${guildData.autoNum}`, {
                    fid: guildData.autoNum,
                    cid: channel.id,
                    title: feedTitle,
                    url: feed,
                    oldData: parseFeed(feedData),
                    errorCount: 0,
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
                // Increase id autonum
                await rss.inc(`${command.guildId}.autoNum`);
                // Send a success message
                // Escape title from markdown
                await command.editReply({
                    content: `${channel} is now following **${Util.escapeMarkdown(
                        feedTitle
                    )}** (<${feed}>).\nMake sure I will have permissions to that channel.\nEdit the posts by using \`/rss edit\``,
                });
                break;
            }
            case "list": {
                // Ensure and get guild RSS data
                const guildData = await rss.ensure(command.guildId, {
                    gid: command.guildId,
                    feeds: {},
                    autoNum: 1,
                });
                // Get feeds
                const feeds = Object.values(guildData.feeds);
                // Incase no feeds reply simply
                if (feeds.length === 0) {
                    await command.editReply({
                        content: "No feeds subscribed.",
                    });
                    return;
                }
                // Paginate feeds
                const pages = [];
                for (let i = 0; i < feeds.length; i += 10) pages.push(feeds.slice(i, i + 10));
                // Use the paginatedEmbed utility to send the pages
                await paginatedEmbed(
                    client,
                    command,
                    // Map pages to embeds
                    pages.map((feedChunk, i) => {
                        const embed = new MessageEmbed()
                            .setTitle(`Feeds (${feeds.length})`)
                            .setColor("#9799ca")
                            // paginatedEmbed function doesn't do page numbers so we have to do them here
                            .setFooter(`Page ${i + 1}/${pages.length}`);
                        // Add a field for each feed
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
                // Get feed id
                const feed = command.options.getInteger("id").toString();
                // Ensure and get guild RSS data
                const guildData = await rss.ensure(command.guildId, {
                    gid: command.guildId,
                    feeds: {},
                    autoNum: 1,
                });
                // Test id existance and reply simply
                if (!Object.keys(guildData.feeds).includes(feed)) {
                    await command.editReply({
                        content: "Invalid feed id. Use `/rss list` to find your feed id.",
                    });
                    return;
                }
                // Delete the field
                await rss.delete(`${command.guildId}.feeds.${feed}`);
                // Reply succesfully and yet again escape markdown
                await command.editReply({
                    content: `Feed **${Util.escapeMarkdown(guildData.feeds[feed].title)}** (<${
                        guildData.feeds[feed].url
                    }>) has been removed!`,
                });
                break;
            }
            case "test": {
                // Get feed id and optional placeholders boolean
                const id = command.options.getInteger("id").toString();
                const placeholders = command.options.getBoolean("placeholders") ?? false;
                // Ensure and get guild RSS data
                const guildData = await rss.ensure(command.guildId, {
                    gid: command.guildId,
                    feeds: {},
                    autoNum: 1,
                });

                // Test id existance and reply simply
                if (!Object.keys(guildData.feeds).includes(id)) {
                    await command.editReply({
                        content: "Invalid feed id. Use `/rss list` to find your feed id.",
                    });
                    return;
                }
                // Get the specified feed
                const feed = guildData.feeds[id];

                // Fetch the feed
                let feedData;
                try {
                    feedData = await fetchFeed(feed.url);
                } catch (e) {
                    // Send error if such occurs
                    await command.editReply({
                        content: `Encountered an error in the RSS feed: \`${e.message}\``,
                    });
                    return;
                }

                // Grab a random item
                const randomPost = feedData[Math.floor(Math.random() * feedData.length)];

                // If the user wants placeholders
                if (placeholders) {
                    // Get placeholders and format them nicely
                    await command.editReply({
                        content: `\`\`\`md\n${getPlaceholders(randomPost)
                            // Escape code blocks as to not mess formatting
                            .map(
                                ([key, val]) =>
                                    `# {${Util.escapeCodeBlock(key)}}\n${Util.escapeCodeBlock(val)}`
                            )
                            .join(
                                "\n"
                                // List inbuilt placeholders
                            )}\n\`\`\`\nTo leave a field empty, use the inbuilt \`{empty}\` placeholder.\nTo get a newline, use the inbuilt \`{newline}\` placeholder.`,
                    });
                } else {
                    // Otherwise
                    try {
                        // Format and reply with the random item
                        await command.editReply(formatPost(randomPost, feed.format));
                    } catch (e) {
                        // And send the error if such occurs
                        await command.editReply({
                            content: `Encountered an error in the RSS feed: \`${e.message}\``,
                        });
                    }
                }
                break;
            }
            case "edit": {
                // Get the feed id, property to edit a value to set to
                const feed = command.options.getInteger("id").toString();
                const property = command.options.getString("property");
                const value = command.options.getString("value");

                // Ensure and get guild RSS data
                const guildData = await rss.ensure(command.guildId, {
                    gid: command.guildId,
                    feeds: {},
                    autoNum: 1,
                });

                // Check id existance and reply simply
                if (!Object.keys(guildData.feeds).includes(feed)) {
                    await command.editReply({
                        content: "Invalid feed id. Use `/rss list` to find your feed id.",
                    });
                    return;
                }

                // Save to database and reply
                await rss.set(`${command.guildId}.feeds.${feed}.format.${property}`, value);
                await command.editReply({
                    content: "Format updated. Use `/rss test` to test it out.",
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
