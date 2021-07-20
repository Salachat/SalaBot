import cron from "node-cron";
import { rss } from "../db.js";
import { fetchFeed, findNewEntries, formatPost } from "./rssUtil.js";

/**
 * Start the RSS handler
 * @param {Client} client
 */
export default (client) => {
    // Run every tenth minute
    cron.schedule("*/10 * * * *", async () => {
        // Get all the servers
        const servers = await rss.values;
        // Loop them
        servers.forEach(async ({ gid, feeds }) => {
            // Loop their feeds
            Object.values(feeds).forEach(async ({ fid, cid, url, oldData, format }) => {
                // Catch any errors
                try {
                    // Fetch the channel
                    let channel;
                    try {
                        channel = await client.channels.fetch(cid);
                    } catch (e) {
                        return;
                    }
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
                    } catch (e) {
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
                                content: `Encountered an error in the RSS feed: \`${e.message}\``,
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
