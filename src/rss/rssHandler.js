import { TextChannel } from "discord.js";
import cron from "node-cron";
import { rss } from "../db.js";
import { fetchFeed, findNewEntries, formatPost } from "./rssUtil.js";

/**
 * Start the RSS handler
 * @param {import("discord.js").Client} client
 */
export default (client) => {
    // Run every tenth minute
    cron.schedule("*/10 * * * *", async () => {
        // Get all the servers
        const servers = await rss.values;
        // Loop them
        servers.forEach(async ({ gid, feeds }) => {
            // Loop their feeds
            Object.values(feeds).forEach(async ({ fid, cid, url, oldData, errorCount, format }) => {
                // Catch any errors
                try {
                    // Fetch the channel
                    let channel;
                    try {
                        channel = await client.channels.fetch(cid);
                    } catch (e) {
                        return;
                    }
                    if (!(channel instanceof TextChannel)) return;
                    // Return if there is no channel or not enough permissions
                    if (
                        !channel
                            .permissionsFor(client.user)
                            .has(["SEND_MESSAGES", "EMBED_LINKS", "VIEW_CHANNEL"])
                    )
                        return;
                    // Fetch the feed data
                    let newData;
                    try {
                        newData = await fetchFeed(url);
                        // Reset error count on succcess
                        if (errorCount !== 0) await rss.set(`${gid}.feeds.${fid}.errorCount`, 0);
                    } catch (e) {
                        // Only for random HTTP errors
                        if (e.message.startsWith("Feed url threw")) {
                            // Wait until error has been happening for an hour
                            if (errorCount + 1 >= 6) {
                                // Reset error count to wait another hour
                                await rss.set(`${gid}.feeds.${fid}.errorCount`, 0);
                                // Send message
                                await channel.send({
                                    content: `No valid response has been received from the RSS feed in the past hour.\nCurrent error message: \`${e.message}\`\nI'll report back in an hour if the error continues.`,
                                });
                                return;
                            }
                            // Increase error count
                            await rss.inc(`${gid}.feeds.${fid}.errorCount`);
                            return;
                        }

                        // Handle errors by sending a error message
                        await channel.send({
                            content: `Encountered an error in the RSS feed: \`${e.message}\``,
                        });
                        return;
                    }
                    // Find the new entries by comparing the new data to the old data
                    const newEntries = findNewEntries(oldData, newData);
                    // Store the new data as the new old data
                    await rss.set(`${gid}.feeds.${fid}.oldData`, newData);
                    // Loop the new entries
                    newEntries.forEach(async (entry) => {
                        try {
                            // Try sending a post formatted with the user specified format
                            await channel.send(formatPost(entry, format));
                        } catch (e) {
                            // Send an error message if that fails
                            await channel.send({
                                content: `Encountered an error in RSS item: \`${e.message}\``,
                            });
                        }
                    });
                } catch (e) {
                    // Ignore
                }
            });
        });
    });
};
