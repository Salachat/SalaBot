import cron from "node-cron";
import { rss } from "../db.js";
import { fetchFeed, findNewEntries, formatPost } from "./rssUtil.js";

export default (client) => {
    cron.schedule("*/10 * * * *", async () => {
        const servers = await rss.values;
        servers.forEach(async ({ gid, feeds }) => {
            Object.values(feeds).forEach(async ({ fid, cid, url, oldData, format }) => {
                try {
                    let channel;
                    try {
                        channel = await client.channels.fetch(cid);
                    } catch (e) {
                        return;
                    }
                    if (
                        !channel
                            .permissionsFor(client.user)
                            .has(["SEND_MESSAGES", "EMBED_LINKS", "VIEW_CHANNEL"])
                    )
                        return;
                    let newData;
                    try {
                        newData = await fetchFeed(url);
                    } catch (e) {
                        await channel.send({
                            content: `Encountered an error in the RSS feed: \`${e.message}\``,
                        });
                        return;
                    }
                    const newEntries = findNewEntries(oldData, newData);
                    await rss.set(`${gid}.feeds.${fid}.oldData`, newData);
                    newEntries.forEach(async (entry) => {
                        try {
                            await channel.send(formatPost(entry, format));
                        } catch (e) {
                            await channel.send({
                                content: `Encountered an error in the RSS feed: \`${e.message}\``,
                            });
                        }
                    });
                } catch (e) {
                    /* ignore */
                }
            });
        });
    });
};
